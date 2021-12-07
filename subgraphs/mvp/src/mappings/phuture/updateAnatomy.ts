import { Address } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { loadOrCreateIndex, loadOrCreateIndexAsset } from '../entities';

export function updateAnatomy(address: Address, assets: Address[], weights: i32[]): void {
  let index = loadOrCreateIndex(address);

  let assetsAddresses: Array<string> = [];

  let copyOfAssets = assets;

  for (let i = 0; i < copyOfAssets.length; i++) {
    let indexAsset = loadOrCreateIndexAsset(address.toHexString(), copyOfAssets[i].toHexString());
    if (!indexAsset) continue;

    indexAsset.weight = BigInt.fromI32(weights[i] as i32);
    indexAsset.save();

    assetsAddresses[i] = copyOfAssets[i].toHexString();
  }

  index._assets = assetsAddresses;
  index.save();
}
