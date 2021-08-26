import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset, Index, IndexAsset } from "../../../types/schema";
import { BigDecimal } from "@graphprotocol/graph-ts";
import { Q112 } from '../../helpers'

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

    let assets = index._assets;
    for (let i = 0; i < assets.length; i++) {
      let indexAsset = IndexAsset.load(assets[i]);
      let asset = Asset.load(indexAsset.asset);
      index.marketCap = index.marketCap.plus(
        asset.vaultReserve
          .times(asset.indexCount.toBigDecimal())
          .div(asset.totalSupply.toBigDecimal())
          .times(asset.basePrice)
          .div(Q112)
      );
    }

    index.save();

  }

  asset.basePrice = event.params.current.toBigDecimal();

  asset.save();
}
