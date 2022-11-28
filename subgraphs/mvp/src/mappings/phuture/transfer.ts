import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';

import { ONE_BI } from '../../../../helpers';
import { Index, Transfer, UserIndex } from '../../types/schema';
import { updateIndexBasePriceByIndex } from '../../utils';
import {
  loadOrCreateAccount,
  loadOrCreateTransaction,
  newUserIndexHistory,
} from '../entities';

export function handleAllIndexesTransfers(
  event: ethereum.Event,
  from: Address,
  to: Address,
  value: BigInt,
): void {
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

  // Track index transfers from index to another index or burning.
  if (!from.equals(Address.zero())) {
    let fromUserIndexId = from
      .toHexString()
      .concat('-')
      .concat(event.address.toHexString());
    let fromUserIndex = UserIndex.load(fromUserIndexId);
    if (!fromUserIndex) {
      fromUserIndex = new UserIndex(fromUserIndexId);
      fromUserIndex.index = event.address.toHexString();
      fromUserIndex.user = from.toHexString();
      fromUserIndex.balance = BigDecimal.zero();
      fromUserIndex.investedCapital = BigDecimal.zero();
    }

    fromUserIndex.investedCapital = fromUserIndex.investedCapital.minus(
      fromUserIndex.investedCapital
        .times(value.toBigDecimal())
        .div(fromUserIndex.balance),
    );
    fromUserIndex.balance = fromUserIndex.balance.minus(value.toBigDecimal());
    // balance * (marketCap / totalSupply)
    fromUserIndex.capitalization = fromUserIndex.balance
      .div(index.totalSupply.toBigDecimal())
      .times(index.marketCap);

    if (fromUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.minus(ONE_BI);
    }

    fromUserIndex.save();

    let fromUIH = newUserIndexHistory(
      fromUserIndex.user,
      fromUserIndex.index,
      tx.timestamp,
      event.logIndex,
    );
    fromUIH.balance = fromUserIndex.balance;
    fromUIH.capitalization = fromUserIndex.capitalization;
    fromUIH.timestamp = event.block.timestamp;
    fromUIH.totalSupply = index.totalSupply;
    fromUIH.save();
  }

  // Track index transfers to index from another index or minting.
  if (!to.equals(Address.zero())) {
    let toUserIndexId = to
      .toHexString()
      .concat('-')
      .concat(event.address.toHexString());
    let toUserIndex = UserIndex.load(toUserIndexId);
    if (!toUserIndex) {
      toUserIndex = new UserIndex(toUserIndexId);
      toUserIndex.index = event.address.toHexString();
      toUserIndex.user = to.toHexString();
      toUserIndex.balance = BigDecimal.zero();
      toUserIndex.investedCapital = BigDecimal.zero();
    }

    if (toUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.plus(ONE_BI);
    }

    toUserIndex.balance = toUserIndex.balance.plus(value.toBigDecimal());
    // capitalization = balance * (marketCap / totalSupply)
    toUserIndex.capitalization = toUserIndex.balance
      .div(index.totalSupply.toBigDecimal())
      .times(index.marketCap);

    toUserIndex.investedCapital = toUserIndex.investedCapital.plus(
      value
        .toBigDecimal()
        .times(index.marketCap)
        .div(index.totalSupply.toBigDecimal()),
    );

    toUserIndex.save();

    let toUIH = newUserIndexHistory(
      toUserIndex.user,
      toUserIndex.index,
      tx.timestamp,
      event.logIndex,
    );
    toUIH.balance = toUserIndex.balance;
    toUIH.capitalization = toUserIndex.capitalization;
    toUIH.timestamp = tx.timestamp;
    toUIH.totalSupply = index.totalSupply;
    toUIH.save();
  }

  index.save();

  let transfer = new Transfer(
    event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.logIndex.toString()),
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
