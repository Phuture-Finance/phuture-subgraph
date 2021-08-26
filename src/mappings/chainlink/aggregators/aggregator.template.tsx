import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset, Index, IndexAsset } from '../../../types/schema'

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("{{{address}}}");
  if (asset === null) {
    return;
  }

  let oldPrice = asset.basePrice;
  let newPrice = event.params.current;

  let indexes = asset.indexes;
  for (let i = 0; i < indexes.length; i++) {
    let indexAsset = IndexAsset.load(indexes[i].toString())
    let index = Index.load(indexAsset.index);
    index.basePrice = index.basePrice
      .minus(indexAsset.weight.toBigDecimal().times(oldPrice))
      .plus(indexAsset.weight.times(newPrice).toBigDecimal());
    index.baseVolume = index.basePrice.times(index.indexCount.toBigDecimal());
    index.save();
  }

  asset.basePrice = newPrice.toBigDecimal();

  asset.save();
}
