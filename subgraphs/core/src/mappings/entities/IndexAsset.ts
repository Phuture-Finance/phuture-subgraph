import { BigInt } from '@graphprotocol/graph-ts';

import { IndexAsset } from '../../types/schema';

export function loadOrCreateIndexAsset(
  indexId: string,
  assetId: string,
): IndexAsset {
  let indexAssetId = indexId.concat('-').concat(assetId);

  let indexAsset = IndexAsset.load(indexAssetId);
  if (!indexAsset) {
    indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.shares = BigInt.zero();

    indexAsset.save();
  }

  return indexAsset;
}
