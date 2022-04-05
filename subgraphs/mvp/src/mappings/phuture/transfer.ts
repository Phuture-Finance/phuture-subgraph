import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Index, Transfer, UserIndex } from '../../types/schema';
import { EMISSION_CONTROLLER_ADDRESS } from '../../../consts';
import { convertTokenToDecimal, loadOrCreateAccount, loadOrCreateTransaction, newUserIndexHistory, loadOrCreateDaylyUserIndexHistory } from '../entities';
import { ONE_BI } from '../../../../helpers';

export function handleAllIndexesTransfers(event: ethereum.Event, from: Address, to: Address, value: BigInt): void {
  let tx = loadOrCreateTransaction(event);

  let index = Index.load(event.address.toHexString());
  if (!index) return;

  loadOrCreateAccount(from);
  loadOrCreateAccount(to);

  let transfers = tx.transfers;

  if (!from.equals(Address.zero()) && from.toHexString() != EMISSION_CONTROLLER_ADDRESS) {
    let fromUserIndexId = from.toHexString().concat('-').concat(event.address.toHexString());
    let fromUserIndex = UserIndex.load(fromUserIndexId);
    if (!fromUserIndex) {
      fromUserIndex = new UserIndex(fromUserIndexId);
      fromUserIndex.index = event.address.toHexString();
      fromUserIndex.user = from.toHexString();
      fromUserIndex.balance = BigDecimal.zero();
    }

    fromUserIndex.balance = fromUserIndex.balance.minus(value.toBigDecimal());

    if (fromUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.minus(ONE_BI);
    }

    fromUserIndex.save();

    let fromUserIndexHistory= newUserIndexHistory(tx, fromUserIndex.user, fromUserIndex.index)
    fromUserIndexHistory.balance = fromUserIndex.balance;
    fromUserIndexHistory.timestamp = tx.timestamp;
    fromUserIndexHistory.save();

    let fromDailyUserIndexHistory =  loadOrCreateDaylyUserIndexHistory(fromUserIndex.user, fromUserIndex.index, tx.timestamp.toI64());

    fromDailyUserIndexHistory.total = fromDailyUserIndexHistory.total.plus(fromUserIndexHistory.balance);
    fromDailyUserIndexHistory.number = fromDailyUserIndexHistory.number.plus(new BigDecimal(BigInt.fromI32(1)));
    fromDailyUserIndexHistory.avgBalance = fromDailyUserIndexHistory.total.div(fromDailyUserIndexHistory.number);
    fromDailyUserIndexHistory.save();
  }

  if (!to.equals(Address.zero()) && to.toHexString() != EMISSION_CONTROLLER_ADDRESS) {
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

    toUserIndex.save();

    let toUserIndexHistory= newUserIndexHistory(tx, toUserIndex.user, toUserIndex.index)
      toUserIndexHistory.balance = toUserIndex.balance;
      toUserIndexHistory.timestamp = tx.timestamp;
      toUserIndexHistory.save();

    toUserIndexHistory.save();

    let toDailyUserIndexHistory =  loadOrCreateDaylyUserIndexHistory(toUserIndex.user, toUserIndex.index, tx.timestamp.toI64());


    toDailyUserIndexHistory.total = toDailyUserIndexHistory.total.plus(toUserIndexHistory.balance);
    toDailyUserIndexHistory.number = toDailyUserIndexHistory.number.plus(new BigDecimal(BigInt.fromI32(1)));
    toDailyUserIndexHistory.avgBalance = toDailyUserIndexHistory.total.div(toDailyUserIndexHistory.number);
    toDailyUserIndexHistory.save();
  }

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

  index.marketCap = convertTokenToDecimal(index.totalSupply, index.decimals).times(index.basePrice);
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
