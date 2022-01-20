import { Asset, Index, IndexAsset, Pair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import {convertTokenToDecimal } from '../entities';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS } from '../../../consts';

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);
  if (!asset0 || !asset1) return;

  pair.asset0Reserve = new BigDecimal(event.params.reserve0);
  pair.asset1Reserve = new BigDecimal(event.params.reserve1);

  updateAssetsBasePrice(event.params.reserve0, event.params.reserve1, asset0, asset1);

  pair.save();
}

export function updateAssetsBasePrice(reserve0: BigInt, reserve1: BigInt, asset0: Asset, asset1: Asset): void {
  let asset0Reserve = convertTokenToDecimal(reserve0, asset0.decimals);
  let asset1Reserve = convertTokenToDecimal(reserve1, asset1.decimals);

  if (asset0.id == BASE_ADDRESS) {
    updateAssetBasePrice(asset0, asset1, asset0Reserve, asset1Reserve);
  }

  if (asset1.id == BASE_ADDRESS) {
    updateAssetBasePrice(asset1, asset0, asset1Reserve, asset0Reserve);
  }
}

function updateAssetBasePrice(baseAsset: Asset, asset: Asset, baseAssetReserve: BigDecimal, assetReserve: BigDecimal): void {
  if (baseAsset.basePrice.equals(BigDecimal.zero())) {
    let newBasePrice = new BigDecimal(BigInt.fromI32(1));
    updateIndexBasePriceByAsset(baseAsset, newBasePrice);
    baseAsset.basePrice = newBasePrice;
    baseAsset.save();
  }

  let newBasePrice = assetReserve.div(baseAssetReserve);
  updateIndexBasePriceByAsset(asset, newBasePrice);
  asset.basePrice = newBasePrice;
  asset.save();
}

export function updateIndexBasePriceByIndex(index: Index): void {
  if (index._assets.length == 0) return;

  index.basePrice = BigDecimal.zero();
  index.marketCap = BigDecimal.zero();
  for (let i = 0; i < index._assets.length; i++) {
    let asset = Asset.load(index._assets[i]);
    if (!asset) continue;

    let ia  = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if (!ia) continue;

    let indexBasePrice = asset.basePrice.times(ia.weight.toBigDecimal().div(BigDecimal.fromString("255")));
    index.basePrice = index.basePrice.plus(indexBasePrice);
    index.marketCap = index.marketCap.plus(convertTokenToDecimal(asset.totalSupply, asset.decimals).times(indexBasePrice));
  }

  index.save();
}

// Updating the index values after changing the base price.
export function updateIndexBasePriceByAsset(asset: Asset, newAssetBasePrice: BigDecimal): void {
  for (let i = 0; i < asset._indexes.length; i++) {
    let index = Index.load(asset._indexes[i]);
    if(!index) continue;

    let ia  = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if(!ia) continue;

    // Decrease previous base price of the asset, at initial basePrice is zero.
    let oldIndexBasePrice = asset.basePrice.times(ia.weight.toBigDecimal().div(BigDecimal.fromString("255")));
    index.basePrice = index.basePrice.minus(oldIndexBasePrice);
    index.marketCap.minus(convertTokenToDecimal(asset.totalSupply, asset.decimals).times(oldIndexBasePrice));

    let newIndexBasePrice = newAssetBasePrice.times(ia.weight.toBigDecimal().div(BigDecimal.fromString("255")));
    index.basePrice = index.basePrice.plus(newIndexBasePrice);
    index.marketCap = index.marketCap.plus(convertTokenToDecimal(asset.totalSupply, asset.decimals).times(newIndexBasePrice));

    index.save();
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
