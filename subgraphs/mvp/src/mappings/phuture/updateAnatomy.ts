import { Address } from "@graphprotocol/graph-ts";
import { BigInt } from "@graphprotocol/graph-ts/index";
import { Index, IndexAsset } from "../../types/schema";

export function updateAnatomy(address: Address, assets: Address[], weights: i32[]): void {
  let index = Index.load(address.toHexString()) as Index;
  if (!index) {
    return;
  }
  for (let i = 0; i < assets.length; i++) {
    let indexAsset = IndexAsset.load(assets[i].toHexString()) as IndexAsset;
    if (!indexAsset) {
      continue;
    }
    indexAsset.weight = BigInt.fromI32(weights[i] as i32);
    indexAsset.save();

    index.assets[i] = indexAsset.id;
    index._assets[i] = assets[i].toHexString();
  }

  index.save();
}
