import { BigDecimal } from '@graphprotocol/graph-ts/index';
import { IndexAsset } from '../../types/schema';

export function loadOrCreateIndexAsset(indexId: string, assetId: string): IndexAsset {
  let indexAsset = IndexAsset.load(indexId);

  if (!indexAsset) {
    let indexAssetId = indexId.concat('-').concat(assetId);

    indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.basePrice = BigDecimal.zero();
    indexAsset.marketCap = BigDecimal.zero();

    indexAsset.vaultTotalSupply = BigDecimal.zero();
  }

  indexAsset.save();

  return indexAsset;
}
