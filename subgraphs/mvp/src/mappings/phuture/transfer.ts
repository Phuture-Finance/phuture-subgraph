import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Index, Transfer, UserIndex } from '../../types/schema';
import { loadOrCreateAccount, loadOrCreateTransaction, newUserIndexHistory, loadOrCreateDaylyUserIndexHistory } from '../entities';
import { ONE_BI } from '../../../../helpers';
import { updateIndexBasePriceByIndex } from "../../utils/index";

export function handleAllIndexesTransfers(event: ethereum.Event, from: Address, to: Address, value: BigInt): void {
  let tx = loadOrCreateTransaction(event);

  let index = Index.load(event.address.toHexString());
  if (!index) return;

  loadOrCreateAccount(from);
  loadOrCreateAccount(to);

  let transfers = tx.transfers;

  let transferType: string;
  if (from.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.plus(value);
    transferType = 'Mint';
  } else if (to.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.minus(value);
    transferType = 'Burn';
  } else {
    transferType = 'Send';
  }

  updateIndexBasePriceByIndex(index, event.block.timestamp);

  // Track index transfers from index to another index or burning.
  if (!from.equals(Address.zero())) {
    let fromUserIndexId = from.toHexString().concat('-').concat(event.address.toHexString());
    let fromUserIndex = UserIndex.load(fromUserIndexId);
    if (!fromUserIndex) {
      fromUserIndex = new UserIndex(fromUserIndexId);
      fromUserIndex.index = event.address.toHexString();
      fromUserIndex.user = from.toHexString();
      fromUserIndex.balance = BigDecimal.zero();
    }

    fromUserIndex.balance = fromUserIndex.balance.minus(value.toBigDecimal());
    fromUserIndex.capitalization = fromUserIndex.balance.div(index.totalSupply.toBigDecimal()).times(index.marketCap);

    if (fromUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.minus(ONE_BI);
    }

    fromUserIndex.save();

    let fromUserIndexHistory = newUserIndexHistory(tx, fromUserIndex.user, fromUserIndex.index);
    fromUserIndexHistory.balance = fromUserIndex.balance;
    fromUserIndexHistory.capitalization = fromUserIndex.capitalization;
    fromUserIndexHistory.timestamp = tx.timestamp;
    fromUserIndexHistory.save();

    let fromDailyUserIndexHistory =  loadOrCreateDaylyUserIndexHistory(fromUserIndex.user, fromUserIndex.index, tx.timestamp.toI64());
    fromDailyUserIndexHistory.total = fromDailyUserIndexHistory.total.plus(fromUserIndexHistory.balance);
    fromDailyUserIndexHistory.number = fromDailyUserIndexHistory.number.plus(new BigDecimal(BigInt.fromI32(1)));
    fromDailyUserIndexHistory.avgBalance = fromDailyUserIndexHistory.total.div(fromDailyUserIndexHistory.number);
    fromDailyUserIndexHistory.save();
  }

  // Track index transfers to index from another index or minting.
  if (!to.equals(Address.zero())) {
    let toUserIndexId = to.toHexString().concat('-').concat(event.address.toHexString());
    let toUserIndex = UserIndex.load(toUserIndexId);
    if (!toUserIndex) {
      toUserIndex = new UserIndex(toUserIndexId);
      toUserIndex.index = event.address.toHexString();
      toUserIndex.user = to.toHexString();
      toUserIndex.balance = BigDecimal.zero();
    }

    if (toUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.plus(ONE_BI);
    }

    toUserIndex.balance = toUserIndex.balance.plus(value.toBigDecimal());
    toUserIndex.capitalization = toUserIndex.balance.div(index.totalSupply.toBigDecimal()).times(index.marketCap);

    toUserIndex.save();

    let toUserIndexHistory = newUserIndexHistory(tx, toUserIndex.user, toUserIndex.index)
    toUserIndexHistory.balance = toUserIndex.balance;
    toUserIndexHistory.capitalization = toUserIndex.capitalization;
    toUserIndexHistory.timestamp = tx.timestamp;
    toUserIndexHistory.save();
    toUserIndexHistory.save();

    let toDailyUserIndexHistory =  loadOrCreateDaylyUserIndexHistory(toUserIndex.user, toUserIndex.index, tx.timestamp.toI64());
    toDailyUserIndexHistory.total = toDailyUserIndexHistory.total.plus(toUserIndexHistory.balance);
    toDailyUserIndexHistory.number = toDailyUserIndexHistory.number.plus(new BigDecimal(BigInt.fromI32(1)));
    toDailyUserIndexHistory.avgBalance = toDailyUserIndexHistory.total.div(toDailyUserIndexHistory.number);
    toDailyUserIndexHistory.save();
  }

  index.save();

  let transfer = new Transfer(
    event.transaction.hash.toHexString().concat('-').concat(BigInt.fromI32(transfers.length).toString()),
  );

  transfer.index = event.address.toHexString();
  transfer.transaction = tx.id;
  transfer.type = transferType;
  transfer.from = from;
  transfer.to = to;
  transfer.value = value;
  transfer.save();

  tx.transfers = transfers.concat([transfer.id]);
  tx.save();
}
// 1d 5d 1m 3m 6m 1y
