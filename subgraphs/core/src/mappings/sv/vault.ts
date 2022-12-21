import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import {  SVTransfer, SVVault, UserVault } from '../../types/schema';
import {
  FCashMinted as FCashMintedEvent,
  Transfer as TransferEvent,
} from '../../types/SVault/Vault';
import {convertDecimals, convertTokenToDecimal} from '../../utils/calc';
import { updateVaultTotals, updateVaultPrice } from '../../utils/vault';
import { loadOrCreateSVAccount } from '../entities';
import { loadOrCreateSVVault } from '../entities';
import { newUserSVHistory } from '../entities';
import {ZERO_ADDRESS} from "@phuture/subgraph-helpers";

export function handleTransfer(event: TransferEvent): void {
  if (event.address.toHexString() == ZERO_ADDRESS) {
    return;
  }
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
    if(fromUser.balance.gt(BigInt.zero())) {
      fromUser.investedCapital = fromUser.investedCapital.minus(
          fromUser.investedCapital
              .times(event.params.value.toBigDecimal())
              .div(fromUser.balance.toBigDecimal())
      )
    }
    fromUser.balance = fromUser.balance.minus(event.params.value);

    if (fromUser.balance.equals(BigInt.zero())) {
      fVault.uniqueHolders = fVault.uniqueHolders.minus(BigInt.fromI32(1));
    }

    fromUser.save();

    updateUserHistories(
      event.params.from.toHexString(),
      fromUser.balance,
      fromUser.investedCapital,
      fVault,
      event.block.timestamp,
      event.logIndex,
    );
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

    // value is 18 decimals
    toUser.balance = toUser.balance.plus(event.params.value);
    let basePrice =  fVault.totalAssets.toBigDecimal()
        .div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12)))
    toUser.investedCapital = toUser.investedCapital.plus(
        convertDecimals(event.params.value.toBigDecimal(), BigInt.fromI32(18)).times(basePrice)
    )
    toUser.save();

    updateUserHistories(
      event.params.to.toHexString(),
      toUser.balance,
      toUser.investedCapital,
      fVault,
      event.block.timestamp,
      event.logIndex,
    );
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
  if (event.address.toHexString() == ZERO_ADDRESS) {
    return;
  }
  let fVault = loadOrCreateSVVault(event.address, event.block.timestamp);

  updateVaultTotals(fVault);
  updateVaultPrice(fVault, event.block.timestamp);

  fVault.save();
}

function updateUserHistories(
  user: string,
  balance: BigInt,
  investedCapital: BigDecimal,
  fVault: SVVault,
  ts: BigInt,
  logIndex: BigInt,
): void {
  let userIndexHistory = newUserSVHistory(user, fVault.id, ts, logIndex);
  userIndexHistory.user = user;
  userIndexHistory.balance = balance;
  userIndexHistory.timestamp = ts;
  userIndexHistory.totalSupply = fVault.totalSupply;
  userIndexHistory.investedCapital = investedCapital;
  userIndexHistory.save();
}
