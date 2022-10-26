import { VTokenTransfer, UpdateDeposit } from '../../types/templates/vToken/vToken';
import { loadOrCreateIndexAsset, loadOrCreateVToken } from '../entities';
import { updateDailyAssetStat, updateStat } from './stats';
import { Asset, Index, vToken } from '../../types/schema';
import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { convertTokenToDecimal } from '../../utils/calc';

export function handlerVTokenTransfer(event: VTokenTransfer): void {
  let vt = vToken.load(event.address.toHexString());
  if (!vt) return;

  if (event.params.from.equals(Address.zero())) {
    updateVToken(vt, event, true);
  }

  // In mint process we always have mint from zero address and to zero addres
  // and we should ignore the burning in such case.
  if (!event.params.from.equals(Address.zero()) && event.params.to.equals(Address.zero())) {
    updateVToken(vt, event, false);
  }

  updateIndexShare(event.params.from, event.params.to, vt.asset, event.params.amount);
}

function updateIndexShare(from: Address, to: Address, assetAddr: string, amount: BigInt): void {
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
  vt.capitalization = asset.basePrice.times(new BigDecimal(vt.platformTotalSupply));
  vt.save();

  // Update asset reserve values.
  if (isInc) {
    asset.vaultReserve = asset.vaultReserve.plus(convertTokenToDecimal(event.params.amount, asset.decimals));
  } else {
    asset.vaultReserve = asset.vaultReserve.minus(convertTokenToDecimal(event.params.amount, asset.decimals));
  }
  asset.vaultBaseReserve = asset.vaultReserve.times(asset.basePrice);
  asset.save();

  let stat = updateStat(event.block.timestamp);
  stat.totalValueLocked = stat.totalValueLocked.plus(
    convertTokenToDecimal(event.params.amount, asset.decimals).times(asset.basePrice),
  );
  stat.save();

  updateDailyAssetStat(event, asset);
}

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.totalAmount = vt.assetReserve.plus(vt.deposited);

  vt.save();
}
