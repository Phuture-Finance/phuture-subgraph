import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import {  SVTransfer, SVVault, UserVault } from '../../types/schema';
import {
  FCashMinted as FCashMintedEvent,
  Transfer as TransferEvent,
} from '../../types/SVault/Vault';
import { convertDecimals } from '../../utils/calc';
import { updateVaultTotals, updateVaultPrice } from '../../utils/vault';
import { loadOrCreateSVAccount } from '../entities';
import { loadOrCreateSVVault } from '../entities';
import { newUserSVHistory } from '../entities';

export function handleTransfer(event: TransferEvent): void {
  let fVault = loadOrCreateSVVault(event.address, event.block.timestamp);

  loadOrCreateSVAccount(event.params.from);
  loadOrCreateSVAccount(event.params.to);

  let transferType: string;
  if (event.params.from.equals(Address.zero())) {
    fVault.totalSupply = fVault.totalSupply.plus(event.params.value);
    transferType = 'Mint';
  } else if (event.params.to.equals(Address.zero())) {
    fVault.totalSupply = fVault.totalSupply.minus(event.params.value);
    transferType = 'Burn';
  } else {
    transferType = 'Send';
  }

  if (!event.params.from.equals(Address.zero())) {
    let fromUserId = event.params.from
      .toHexString()
      .concat('-')
      .concat(event.address.toHexString());
    let fromUser = UserVault.load(fromUserId);
    if (!fromUser) {
      fromUser = new UserVault(fromUserId);
      fromUser.vault = event.address.toHexString();
      fromUser.user = event.params.from.toHexString();
      fromUser.balance = BigInt.zero();
    }
    fromUser.balance = fromUser.balance.minus(event.params.value);

    if (fromUser.balance.equals(BigInt.zero())) {
      fVault.uniqueHolders = fVault.uniqueHolders.minus(BigInt.fromI32(1));
    }

    let capitalization =
        convertDecimals(fromUser.balance.toBigDecimal(),
            fVault.decimals,
        ).times(fVault.basePrice);
    updateUserHistories(
      event.params.from.toHexString(),
      fromUser.balance,
      capitalization,
      fVault,
      event.block.timestamp,
      event.logIndex,
    );

    fromUser.save();
  }

  if (!event.params.to.equals(Address.zero())) {
    let toUserId = event.params.to
      .toHexString()
      .concat('-')
      .concat(event.address.toHexString());
    let toUser = UserVault.load(toUserId);
    if (!toUser) {
      toUser = new UserVault(toUserId);
      toUser.vault = event.address.toHexString();
      toUser.user = event.params.to.toHexString();
      toUser.balance = BigInt.zero();
    }

    if (toUser.balance.equals(BigInt.zero())) {
      fVault.uniqueHolders = fVault.uniqueHolders.plus(BigInt.fromI32(1));
    }

    toUser.balance = toUser.balance.plus(event.params.value);

    let capitalization = convertDecimals(
        toUser.balance.toBigDecimal(),
        fVault.decimals,
    ).times(fVault.basePrice);
    updateUserHistories(
      event.params.to.toHexString(),
      toUser.balance,
        capitalization,
      fVault,
      event.block.timestamp,
      event.logIndex,
    );

    toUser.save();
  }

  let trFrom = SVTransfer.load(event.params.from.toHexString());
  if (!trFrom) {
    trFrom = new SVTransfer(event.transaction.hash.toHexString());
    trFrom.to = event.params.to.toHexString();
    trFrom.from = event.params.from.toHexString();
    trFrom.value = event.params.value;
    trFrom.timestamp = event.block.timestamp;
    trFrom.type = transferType;
    trFrom.save();
  }

  let trTo = SVTransfer.load(event.transaction.hash.toHexString());
  if (!trTo) {
    trTo = new SVTransfer(event.params.to.toHexString());
    trTo.to = event.params.to.toHexString();
    trTo.from = event.params.from.toHexString();
    trTo.value = event.params.value;
    trTo.timestamp = event.block.timestamp;
    trTo.type = transferType;
    trTo.save();
  }

  updateVaultTotals(fVault);
  updateVaultPrice(fVault, event.block.timestamp);

  fVault.save();
}

export function handleFCashMinted(event: FCashMintedEvent): void {
  let fVault = loadOrCreateSVVault(event.address, event.block.timestamp);

  updateVaultTotals(fVault);
  updateVaultPrice(fVault, event.block.timestamp);

  fVault.save();
}

function updateUserHistories(
  user: string,
  balance: BigInt,
  cap: BigDecimal,
  fVault: SVVault,
  ts: BigInt,
  logIndex: BigInt,
): void {
  let userIndexHistory = newUserSVHistory(user, fVault.id, ts, logIndex);
  userIndexHistory.user = user;
  userIndexHistory.balance = balance;
  userIndexHistory.capitalization = cap;
  userIndexHistory.timestamp = ts;
  userIndexHistory.totalSupply = fVault.totalSupply;
  userIndexHistory.save();
}
