// @ts-ignore

import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset, Index, IndexAsset } from "../../../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD } from "../../helpers";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("{{{address}}}");
  if (asset === null) {
    return;
  }

  let newPrice = event.params.current.toBigDecimal()
    .div(BigInt.fromI32(10).pow({{{decimals}}}).toBigDecimal())

  let indexes = asset._indexes;
  for (let i = 0; i < indexes.length; i++) {
    let indexAsset = IndexAsset.load(indexes[i]);
    let index = Index.load(indexAsset.index);

    let weight = indexAsset.weight.toBigDecimal().div(BigDecimal.fromString("255"));

    if (indexAsset.basePrice.gt(ZERO_BD)) {
      index.basePrice = index.basePrice.minus(indexAsset.basePrice);
    }

    indexAsset.basePrice = weight.times(newPrice);

    index.basePrice = index.basePrice.plus(indexAsset.basePrice);
    index.baseVolume = index.basePrice.times(index.totalSupply);

    if (indexAsset.marketCap.gt(ZERO_BD)) {
      index.marketCap = index.marketCap.minus(indexAsset.marketCap);
    }

    indexAsset.marketCap = asset.vaultReserve
      .times(asset.indexCount.toBigDecimal())
      .div(asset.totalSupply.toBigDecimal())
      .times(newPrice);

    index.marketCap = index.marketCap.plus(indexAsset.marketCap);

    indexAsset.save();
    index.save();
  }

  asset.basePrice = newPrice;

  asset.save();
}
