import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';

import {
  Asset,
  Index,
  vToken as vTokenEntity,
  VaultController,
} from '../../types/schema';
import {
  VTokenTransfer,
  UpdateDeposit,
  SetVaultController,
} from '../../types/templates/vToken/vToken';
import { convertTokenToDecimal } from '../../utils/calc';
import { loadOrCreateIndexAsset, loadOrCreateVToken } from '../entities';

import { updateDailyAssetStat } from './stats';

export function handlerSetVaultController(event: SetVaultController): void {
  let vToken = vTokenEntity.load(event.address.toHexString());
  if (!vToken) return;

  if (event.params.vaultController == Address.zero()) {
    vToken.vaultController = null;
    vToken.apy = BigDecimal.zero();

    vToken.save();
  }

  let vaultControllerAddress = event.params.vaultController.toHexString();
  let vaultController = VaultController.load(vaultControllerAddress);
  if (!vaultController) {
    vaultController = new VaultController(
      event.params.vaultController.toHexString(),
    );
    vaultController.vToken = event.address.toHexString();

    vToken.vaultController = vaultControllerAddress;

    vaultController.save();
  }

  log.debug('handleSetVaultController: {}', [
    event.params.vaultController.toHexString(),
  ]);
}

export function handlerVTokenTransfer(event: VTokenTransfer): void {
  let vToken = vTokenEntity.load(event.address.toHexString());
  if (!vToken) return;

  if (event.params.from.equals(Address.zero())) {
    updateVToken(vToken, event, true);
  }

  // In mint process we always have mint from zero address and to zero address,
  // and we should ignore the burning in such case.
  if (
    !event.params.from.equals(Address.zero()) &&
    event.params.to.equals(Address.zero())
  ) {
    updateVToken(vToken, event, false);
  }

  updateIndexShare(
    event.params.from,
    event.params.to,
    vToken.asset,
    event.params.amount,
  );
}

function updateIndexShare(
  from: Address,
  to: Address,
  assetAddr: string,
  amount: BigInt,
): void {
  if (!from.equals(Address.zero()) && Index.load(from.toHexString())) {
    let fromIA = loadOrCreateIndexAsset(from.toHexString(), assetAddr);
    fromIA.shares = fromIA.shares.minus(amount);

    fromIA.save();
  }

  if (!to.equals(Address.zero()) && Index.load(to.toHexString())) {
    let toIA = loadOrCreateIndexAsset(to.toHexString(), assetAddr);
    toIA.shares = toIA.shares.plus(amount);

    toIA.save();
  }
}

function updateVToken(
  vt: vTokenEntity,
  event: VTokenTransfer,
  isInc: bool,
): void {
  let asset = Asset.load(vt.asset);
  if (!asset) {
    log.warning('updateVToken: asset not found {}', [vt.asset]);
    return;
  }

  if (isInc) {
    vt.platformTotalSupply = vt.platformTotalSupply.plus(event.params.amount);
  } else {
    vt.platformTotalSupply = vt.platformTotalSupply.minus(event.params.amount);
  }
  vt.capitalization = asset.basePrice.times(
    new BigDecimal(vt.totalAmount), // TODO multiply with totalAmount
  );

  vt.save();

  // Update asset reserve values.
  if (isInc) {
    asset.vaultReserve = asset.vaultReserve.plus(
      convertTokenToDecimal(event.params.amount, asset.decimals),
    );
  } else {
    asset.vaultReserve = asset.vaultReserve.minus(
      convertTokenToDecimal(event.params.amount, asset.decimals),
    );
  }

  asset.vaultBaseReserve = asset.vaultReserve.times(asset.basePrice);

  asset.save();

  updateDailyAssetStat(event, asset);
}

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vToken = loadOrCreateVToken(event.address);

  vToken.deposited = event.params.depositedAmount;
  vToken.totalAmount = vToken.assetReserve.plus(vToken.deposited);

  vToken.save();
}
