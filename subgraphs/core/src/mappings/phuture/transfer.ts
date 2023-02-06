import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';

import { ONE_BI } from '../../../../helpers';
import { Index, Transfer, UserIndex } from '../../types/schema';
import { updateIndexBasePriceByIndex } from '../../utils';
import { convertDecimals } from '../../utils/calc';
import { loadOrCreateAccount, loadOrCreateTransaction } from '../entities';

import { updateUserIndexHistory } from './stats';

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

    if (fromUserIndex.balance.gt(BigDecimal.zero())) {
      if (value.toBigDecimal().ge(fromUserIndex.balance)) {
        fromUserIndex.investedCapital = BigDecimal.zero();
      } else {
        fromUserIndex.investedCapital = fromUserIndex.investedCapital.minus(
          fromUserIndex.investedCapital
            .times(value.toBigDecimal())
            .div(fromUserIndex.balance),
        );
      }
    }
    fromUserIndex.balance = fromUserIndex.balance.minus(value.toBigDecimal());

    if (fromUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.minus(ONE_BI);
    }

    fromUserIndex.save();

    updateUserIndexHistory(
      fromUserIndex,
      index.totalSupply,
      event.block.timestamp,
    );
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

    toUserIndex.investedCapital = toUserIndex.investedCapital.plus(
      convertDecimals(value.toBigDecimal(), index.decimals).times(
        index.basePrice,
      ),
    );

    toUserIndex.save();

    updateUserIndexHistory(
      toUserIndex,
      index.totalSupply,
      event.block.timestamp,
    );
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
