import { Asset, Index, IndexAsset, Pair, vToken } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import { convertTokenToDecimal } from '../entities';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS } from '../../../consts';
import {
  updateDailyIndexStat, updateHalfYearIndexStat,
  updateHourlyIndexStat,
  updateMonthlyIndexStat, updateThreeMonthIndexStat,
  updateWeeklyIndexStat, updateYearlyIndexStat
} from "../phuture/stats";

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);
  if (!asset0 || !asset1) return;

  pair.asset0Reserve = new BigDecimal(event.params.reserve0);
  pair.asset1Reserve = new BigDecimal(event.params.reserve1);

  updateAssetsBasePrice(event.params.reserve0, event.params.reserve1, asset0, asset1, event.block.timestamp);

  pair.save();
}

export function updateAssetsBasePrice(reserve0: BigInt, reserve1: BigInt, asset0: Asset, asset1: Asset, ts: BigInt): void {
  let asset0Reserve = convertTokenToDecimal(reserve0, asset0.decimals);
  let asset1Reserve = convertTokenToDecimal(reserve1, asset1.decimals);

  if (asset0.id == BASE_ADDRESS) {
    updateAssetBasePrice(asset0, asset1, asset0Reserve, asset1Reserve, ts);
  }

  if (asset1.id == BASE_ADDRESS) {
    updateAssetBasePrice(asset1, asset0, asset1Reserve, asset0Reserve, ts);
  }
}

function updateAssetBasePrice(
  baseAsset: Asset,
  asset: Asset,
  baseAssetReserve: BigDecimal,
  assetReserve: BigDecimal,
  ts: BigInt
): void {
  if (baseAsset.basePrice.equals(BigDecimal.zero())) {
    baseAsset.basePrice = new BigDecimal(BigInt.fromI32(1));
    baseAsset.save();
    updateIndexBasePriceByAsset(baseAsset, ts);
    updateCapVToken(baseAsset);
  }

  asset.basePrice = assetReserve.div(baseAssetReserve);
  asset.save();
  updateIndexBasePriceByAsset(asset, ts);
  updateCapVToken(asset);
}

export function updateCapVToken(asset: Asset): void {
  for (let i = 0; i < asset._vTokens.length; i++) {
    let vt = vToken.load(asset._vTokens[i]);
    if (!vt) continue;

    vt.capitalisation = asset.basePrice.times(new BigDecimal(vt.platformTotalSupply));
    vt.save();
  }
}

export function updateIndexBasePriceByIndex(index: Index, ts: BigInt): void {
  if (index._assets.length == 0) return;

  index.basePrice = BigDecimal.zero();
  for (let i = 0; i < index._assets.length; i++) {
    let asset = Asset.load(index._assets[i]);
    if (!asset) continue;

    let ia = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if (!ia) continue;

    let indexBasePrice = asset.basePrice.times(ia.weight.toBigDecimal().div(BigDecimal.fromString('255')));
    index.basePrice = index.basePrice.plus(indexBasePrice);
  }

  index.marketCap = convertTokenToDecimal(index.totalSupply, index.decimals).times(index.basePrice);

  index.save();

  updateHourlyIndexStat(index, ts);
  updateDailyIndexStat(index, ts);
  updateWeeklyIndexStat(index, ts);
  updateMonthlyIndexStat(index, ts);
  updateThreeMonthIndexStat(index, ts);
  updateHalfYearIndexStat(index, ts);
  updateYearlyIndexStat(index, ts);
}

// Updating the index values after changing the base price.
export function updateIndexBasePriceByAsset(asset: Asset, ts: BigInt): void {
  for (let i = 0; i < asset._indexes.length; i++) {
    let index = Index.load(asset._indexes[i]);
    if (!index) continue;

    updateIndexBasePriceByIndex(index, ts);
  }
}

export function handleTransfer(event: Transfer): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  if (event.params.from.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.plus(event.params.value);
  }

  if (event.params.to.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.minus(event.params.value);
  }

  pair.save();
}
