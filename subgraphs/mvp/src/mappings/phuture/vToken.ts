import { VTokenTransfer, UpdateDeposit } from '../../types/templates/vToken/vToken';
import { convertTokenToDecimal, loadOrCreateVToken, loadVToken } from '../entities';
import { updateDailyAssetStat, updateStat } from './stats';
import { Asset, vToken } from '../../types/schema';
import { Address, log } from '@graphprotocol/graph-ts';

export function handlerVTokenTransfer(event: VTokenTransfer): void {
  let vt = vToken.load(event.address.toHexString());
  if (!vt) return;

  if (event.params.from.equals(Address.zero())) {
    updateVToken(vt, event, true);
  }
  if (event.params.to.equals(Address.zero())) {
    updateVToken(vt, event, false);
  }
}

function updateVToken(vt: vToken, event: VTokenTransfer, isInc: bool): void {
  let asset = Asset.load(vt.asset);
  if (!asset) {
    log.warning('updateVToken: asset not found {}', [vt.asset]);
    return;
  }

  if (isInc) {
    vt.platformTotalSupply = vt.platformTotalSupply.plus(event.params.amount);
    vt.platformTotalSupplyDec = vt.platformTotalSupplyDec.plus(
      convertTokenToDecimal(event.params.amount, asset.decimals),
    );
  } else {
    vt.platformTotalSupply = vt.platformTotalSupply.minus(event.params.amount);
    vt.platformTotalSupplyDec = vt.platformTotalSupplyDec.minus(
      convertTokenToDecimal(event.params.amount, asset.decimals),
    );
  }
  vt.save();

  // Update asset reserve values.
  if (isInc) {
    asset.vaultReserve = asset.vaultReserve.plus(convertTokenToDecimal(event.params.amount, asset.decimals));
  } else {
    asset.vaultReserve = asset.vaultReserve.minus(convertTokenToDecimal(event.params.amount, asset.decimals));
  }
  asset.vaultBaseReserve = asset.vaultReserve.times(asset.basePrice);
  asset.save();

  let stat = updateStat(event);
  stat.totalValueLocked = stat.totalValueLocked.plus(
    convertTokenToDecimal(event.params.amount, asset.decimals).times(asset.basePrice),
  );
  stat.save();

  updateDailyAssetStat(event, asset);
}

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.save();
}
