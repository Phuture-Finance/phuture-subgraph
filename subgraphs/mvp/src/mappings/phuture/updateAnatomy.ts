import { Address, store } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import {loadOrCreateAsset, loadOrCreateIndex, loadOrCreateIndexAsset} from '../entities';
import { updateIndexBasePriceByIndex } from "../uniswap/uniswapPair";

export function updateAnatomy(address: Address, assetAddr: Address, weight: i32): void {
  let index = loadOrCreateIndex(address);
  let assetsAddr = index._assets;
  let asset = loadOrCreateAsset(assetAddr);

  let indexAsset = loadOrCreateIndexAsset(address.toHexString(), assetAddr.toHexString());
  if (weight == 0) {
    assetsAddr = [];
    for (let i = 0; i < index._assets.length; i++) {
      if (index._assets[i] != asset.id) {
        assetsAddr.push(index._assets[i]);
      }
    }
    store.remove('IndexAsset', indexAsset.id);
  } else {
    assetsAddr.push(asset.id);
    indexAsset.weight = BigInt.fromI32(weight as i32);
    indexAsset.save();
  }

  index._assets = assetsAddr;
  index.save();

  updateIndexBasePriceByIndex(index);
}
