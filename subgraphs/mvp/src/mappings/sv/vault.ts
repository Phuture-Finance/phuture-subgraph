import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import { FCash, SVTransfer, SVVault, UserVault } from '../../types/schema';
import {
  FCashMinted as FCashMintedEvent,
  Transfer as TransferEvent,
} from '../../types/SVault/Vault';
import { convertDecimals, convertTokenToDecimal } from '../../utils/calc';
import { updateVaultTotals, updateVaultPrice } from '../../utils/vault';
import { loadOrCreateSVAccount } from '../entities';
import { loadOrCreateSVVault } from '../entities';
import { loadOrCreateDailyUserSVHistory, newUserSVHistory } from '../entities';

let fCashDec = 8;
let usdcDec = 6;

let threeMonthSecond = BigInt.fromI32(60 * 60 * 24 * 30 * 3);
let sixMonthSecond = BigInt.fromI32(60 * 60 * 24 * 30 * 6);
let oneYearSecond = BigInt.fromI32(60 * 60 * 24 * 365);

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
    if (!fVault.totalSupply.isZero()) {
      fromUser.capitalization = convertDecimals(
        fromUser.balance.toBigDecimal(),
        fVault.decimals,
      ).times(fVault.basePrice);
    }

    updateUserHistories(
      event.params.from.toHexString(),
      fromUser.balance,
      fromUser.capitalization,
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

    toUser.balance = toUser.balance.plus(event.params.value);
    if (!fVault.totalSupply.isZero()) {
      toUser.capitalization = convertDecimals(
        toUser.balance.toBigDecimal(),
        fVault.decimals,
      ).times(fVault.basePrice);
    }

    updateUserHistories(
      event.params.to.toHexString(),
      toUser.balance,
      toUser.capitalization,
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

  let id = event.params._fCashPosition.toHexString().concat('-');
  id = id.concat(event.block.timestamp.toString()).concat('-');
  id = id.concat(event.logIndex.toString());

  let fc = new FCash(id);

  fc.vault = event.address.toHexString();
  fc.position = event.params._fCashPosition.toHexString();
  fc.amount = event.params._fCashAmount;
  fc.assetAmount = event.params._assetAmount;
  fc.timestamp = event.block.timestamp;
  fc.isRedeem = false;
  fc.save();

  updateVaultTotals(fVault);
  updateVaultPrice(fVault, event.block.timestamp);

  fVault.save();
}

export function calculateAPR(fCash: Array<string>, ts: BigInt): BigDecimal {
  let threeMonth = [] as Array<FCash>;
  let sixMonth = [] as Array<FCash>;

  let arp = BigDecimal.zero();

  for (let i = 0; i < fCash.length; i++) {
    let fc = FCash.load(fCash[i]);
    if (!fc) continue;

    let delta = fc.maturity.minus(ts);
    if (delta.lt(threeMonthSecond)) {
      threeMonth.push(fc);
    } else if (delta.lt(sixMonthSecond)) {
      sixMonth.push(fc);
    }
  }

  let totalAssetAmount = BigInt.zero();
  let totalFCash = BigInt.zero();
  for (let i = 0; i < threeMonth.length; i++) {
    totalAssetAmount = totalAssetAmount.plus(threeMonth[i].assetAmount);
    totalFCash = totalFCash.plus(threeMonth[i].amount);
  }

  if (!totalAssetAmount.isZero() && !totalFCash.isZero()) {
    arp = arp.plus(
      convertTokenToDecimal(totalFCash, BigInt.fromI32(fCashDec))
        .div(convertTokenToDecimal(totalAssetAmount, BigInt.fromI32(usdcDec)))
        .minus(BigInt.fromI32(1).toBigDecimal())
        .times(oneYearSecond.toBigDecimal())
        .div(threeMonthSecond.toBigDecimal()),
    );
  }

  totalAssetAmount = BigInt.zero();
  totalFCash = BigInt.zero();
  for (let i = 0; i < sixMonth.length; i++) {
    totalAssetAmount = totalAssetAmount.plus(sixMonth[i].assetAmount);
    totalFCash = totalFCash.plus(sixMonth[i].amount);
  }

  if (totalAssetAmount.isZero() || totalFCash.isZero()) {
    return arp;
  }

  return arp.plus(
    convertTokenToDecimal(totalFCash, BigInt.fromI32(fCashDec))
      .div(convertTokenToDecimal(totalAssetAmount, BigInt.fromI32(usdcDec)))
      .minus(BigInt.fromI32(1).toBigDecimal())
      .times(oneYearSecond.toBigDecimal())
      .div(sixMonthSecond.toBigDecimal()),
  );
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
  userIndexHistory.logIndex = logIndex;
  userIndexHistory.totalSupply = fVault.totalSupply;
  userIndexHistory.save();

  let fromDailyUIH = loadOrCreateDailyUserSVHistory(user, fVault.id, ts);
  fromDailyUIH.total = fromDailyUIH.total.plus(
    userIndexHistory.balance.toBigDecimal(),
  );
  fromDailyUIH.totalCap = fromDailyUIH.totalCap.plus(
    userIndexHistory.capitalization,
  );
  fromDailyUIH.totalSupply = fVault.totalSupply;
  fromDailyUIH.save();
}
