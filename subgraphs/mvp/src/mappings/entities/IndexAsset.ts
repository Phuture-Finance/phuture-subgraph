import { BigDecimal } from '@graphprotocol/graph-ts/index';
import { IndexAsset } from '../../types/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function loadOrCreateIndexAsset(indexId: string, assetId: string): IndexAsset {
  let indexAsset = IndexAsset.load(indexId);

  if (!indexAsset) {
    let indexAssetId = indexId.concat('-').concat(assetId);

    indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.basePrice = BigDecimal.zero(); // @deprecated
    indexAsset.marketCap = BigDecimal.zero();
    indexAsset.shares = BigInt.zero();
  }

  indexAsset.save();

  return indexAsset;
}
