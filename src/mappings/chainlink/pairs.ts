import { AnswerUpdated, NewRound } from "../../types/ChainLink/AggregatorInterface";
import { createAsset } from "../helpers";
import { Address } from "@graphprotocol/graph-ts";

export function handleAnswerUpdatedForAsset(assetId: string, event: AnswerUpdated): void {
  let asset = createAsset(Address.fromString(assetId));

  asset.basePrice = event.params.current.toBigDecimal();

  asset.save();
}
