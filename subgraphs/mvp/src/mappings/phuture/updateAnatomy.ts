import { Address, store } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { loadOrCreateIndex, loadOrCreateIndexAsset } from '../entities';

export function updateAnatomy(address: Address, asset: Address, weight: i32): void {
  let index = loadOrCreateIndex(address);

  let assetsAddresses = index._assets;

  let indexAsset = loadOrCreateIndexAsset(address.toHexString(), asset.toHexString());
  if (weight == 0) {
    assetsAddresses = [];
    for (let i = 0; i < index._assets.length; i++) {
      if (index._assets[i] != asset.toHexString()) {
        assetsAddresses.push(index._assets[i]);
      }
    }
    store.remove('IndexAsset', indexAsset.id);
  } else {
    assetsAddresses.push(asset.toHexString());
    indexAsset.weight = BigInt.fromI32(weight as i32);
    indexAsset.save();
  }

  index._assets = assetsAddresses;
  index.save();
}
