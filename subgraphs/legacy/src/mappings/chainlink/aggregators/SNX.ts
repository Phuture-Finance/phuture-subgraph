// @ts-ignore

import { AnswerUpdated } from "../../../types/SNX/AggregatorInterface";
import { Asset, Index, IndexAsset } from "../../../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD } from "../../helpers";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("0xcd6c23637b0d1de0cacd7ad81ae6701a14814721");
  if (!asset) {
    return;
  }

  let newPrice = event.params.current
    .div(BigInt.fromI32(10).pow(8)).toBigDecimal()

  let indexes = asset._indexes;
  for (let i = 0; i < indexes.length; i++) {
    let indexAsset = IndexAsset.load(indexes[i]);
    if (!indexAsset) {
      return;
    }
    let index = Index.load(indexAsset.index);
    if (!index) {
      return;
    }

    let weight = indexAsset.weight.toBigDecimal().div(BigDecimal.fromString("255"));

    if (indexAsset.basePrice.gt(ZERO_BD)) {
      index.basePrice = index.basePrice.minus(indexAsset.basePrice);
    }

    indexAsset.basePrice = weight.times(newPrice);

    index.basePrice = index.basePrice.plus(indexAsset.basePrice);

    index.baseVolume = index.basePrice.times(index.totalSupply
      .div(BigInt.fromI32(10)
        .pow(index.decimals.toI32() as u8)
        .toBigDecimal()
      ));

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
