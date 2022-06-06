import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Index, Transfer, UserIndex } from '../../types/schema';
import {
  loadOrCreateAccount,
  loadOrCreateTransaction,
  newUserIndexHistory,
  loadOrCreateDaylyUserIndexHistory,
  newDailyCapitalization, newUserCapitalization
} from '../entities';
import { ONE_BI } from '../../../../helpers';
import { updateIndexBasePriceByIndex } from "../../utils";
import { convertTokenToDecimal } from "../../utils/calc";

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

  updateIndexBasePriceByIndex(index, tx.timestamp);

  let userCap = newUserCapitalization(index.id, tx.timestamp, event.logIndex);
  userCap.capitalization = convertTokenToDecimal(index.totalSupply, index.decimals).times(index.marketCap);
  userCap.save();

  let dailyCap = newDailyCapitalization(index.id, tx.timestamp);
  dailyCap.capitalization = userCap.capitalization;
  dailyCap.save();

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

    let fromUIH = newUserIndexHistory(fromUserIndex.user, fromUserIndex.index, tx.timestamp, event.logIndex);
    fromUIH.balance = fromUserIndex.balance;
    fromUIH.capitalization = fromUserIndex.capitalization;
    fromUIH.timestamp = event.block.timestamp;
    fromUIH.logIndex = event.logIndex;
    fromUIH.totalSupply = index.totalSupply;
    fromUIH.save();

    let fromDailyUIH = loadOrCreateDaylyUserIndexHistory(fromUserIndex.user, fromUserIndex.index, tx.timestamp);
    fromDailyUIH.total = fromDailyUIH.total.plus(fromUIH.balance);
    fromDailyUIH.totalCap = fromDailyUIH.totalCap.plus(fromUIH.capitalization);
    fromDailyUIH.number = fromDailyUIH.number.plus(new BigDecimal(BigInt.fromI32(1)));
    fromDailyUIH.avgBalance = fromDailyUIH.total.div(fromDailyUIH.number);
    fromDailyUIH.avgCapitalization = fromDailyUIH.totalCap.div(fromDailyUIH.number);
    fromDailyUIH.totalSupply = index.totalSupply;
    fromDailyUIH.save();
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

    let toUIH = newUserIndexHistory(toUserIndex.user, toUserIndex.index, tx.timestamp, event.logIndex)
    toUIH.balance = toUserIndex.balance;
    toUIH.capitalization = toUserIndex.capitalization;
    toUIH.timestamp = tx.timestamp;
    toUIH.logIndex = event.logIndex;
    toUIH.totalSupply = index.totalSupply;
    toUIH.save();

    let toDailyUIH = loadOrCreateDaylyUserIndexHistory(toUserIndex.user, toUserIndex.index, tx.timestamp);
    toDailyUIH.total = toDailyUIH.total.plus(toUIH.balance);
    toDailyUIH.totalCap = toDailyUIH.totalCap.plus(toUIH.capitalization);
    toDailyUIH.number = toDailyUIH.number.plus(new BigDecimal(BigInt.fromI32(1)));
    toDailyUIH.avgBalance = toDailyUIH.total.div(toDailyUIH.number);
    toDailyUIH.avgCapitalization = toDailyUIH.totalCap.div(toDailyUIH.number);
    toDailyUIH.totalSupply = index.totalSupply;
    toDailyUIH.save();
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
