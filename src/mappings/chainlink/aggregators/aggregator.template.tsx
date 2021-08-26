import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset, Index, IndexAsset } from "../../../types/schema";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("{{{address}}}");
  if (asset === null) {
    return;
  }

  let newPrice = event.params.current.toBigDecimal();

  let indexes = asset._indexes;

  for (let i = 0; i < asset.indexCount.toI32(); i++) {
    let indexAsset = IndexAsset.load(indexes[i]);
    let index = Index.load(indexAsset.index);

    index.basePrice = index.basePrice
      .minus(indexAsset.weight.toBigDecimal().times(asset.basePrice))
      .plus(indexAsset.weight.toBigDecimal()).times(newPrice);
    index.baseVolume = index.basePrice.times(index.indexCount.toBigDecimal());

    index.save();
  }

  asset.basePrice = event.params.current.toBigDecimal();

  asset.save();
}
