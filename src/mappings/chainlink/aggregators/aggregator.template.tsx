import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset, Index, IndexAsset } from "../../../types/schema";
import { BigDecimal } from "@graphprotocol/graph-ts";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("{{{address}}}");
  if (asset === null) {
    return;
  }

  let indexes = asset._indexes;

  for (let i = 0; i < indexes.length; i++) {
    let indexAsset = IndexAsset.load(indexes[i]);
    let index = Index.load(indexAsset.index);

    index.basePrice = index.basePrice
      .minus(indexAsset.weight.toBigDecimal()
        .div(BigDecimal.fromString("255"))
        .times(asset.basePrice)
      )
      .plus(indexAsset.weight.toBigDecimal()
        .div(BigDecimal.fromString("255"))
        .times(event.params.current.toBigDecimal())
      );
    index.baseVolume = index.basePrice.times(index.indexCount.toBigDecimal());

    index.save();
  }

  asset.basePrice = event.params.current.toBigDecimal();

  asset.save();
}
