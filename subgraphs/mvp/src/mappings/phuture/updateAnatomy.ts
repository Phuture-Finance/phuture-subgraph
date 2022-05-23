import { Address } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { loadOrCreateAsset, loadOrCreateIndex, loadOrCreateIndexAsset } from '../entities';
import { updateIndexBasePriceByIndex } from '../../utils';

export function updateAnatomy(address: Address, assetAddr: Address, weight: i32, ts: BigInt): void {
  let index = loadOrCreateIndex(address);
  let asset = loadOrCreateAsset(assetAddr);
  let indexAsset = loadOrCreateIndexAsset(address.toHexString(), assetAddr.toHexString());

  let assetsAddr = index._assets;
  let inactiveAssets = index._inactiveAssets;
  let indicesAddr = asset._indexes;

  if (weight == 0) {
    if (inactiveAssets.indexOf(asset.id) == -1) {
      inactiveAssets.push(asset.id);
    }

    indicesAddr = [];
    for (let i = 0; i < asset._indexes.length; i++) {
      if (asset._indexes[i] != index.id) {
        indicesAddr.push(asset._indexes[i]);
      }
    }

    asset.indexCount = asset.indexCount.minus(BigInt.fromI32(1));
    asset._indexes = indicesAddr;
    asset.save();

    indexAsset.index = null;
    indexAsset.inactiveIndex = index.id;
    indexAsset.save();
  } else {
    inactiveAssets = [];
    for (let i = 0; i < index._inactiveAssets.length; i++) {
      if (index._inactiveAssets[i] != asset.id) {
        inactiveAssets.push(index._inactiveAssets[i]);
      }
    }

    if (!assetsAddr.includes(asset.id)) {
      assetsAddr.push(asset.id);

      asset._indexes = asset._indexes.concat([index.id]);
      asset.indexCount = asset.indexCount.plus(BigInt.fromI32(1));
      asset.save();
    }
    indexAsset.weight = BigInt.fromI32(weight as i32);
    indexAsset.index = index.id;
    indexAsset.inactiveIndex = null;
    indexAsset.save();
  }

  index._inactiveAssets = inactiveAssets;
  index._assets = assetsAddr;
  index.save();

  updateIndexBasePriceByIndex(index, ts);
}
