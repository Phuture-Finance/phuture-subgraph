import { AnswerUpdated } from "../../../types/{{{name}}}/AggregatorInterface";
import { Asset } from "../../../types/schema";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let asset = Asset.load("{{{address}}}");
  if (asset === null) {
    return;
  }

  asset.basePrice = event.params.current.toBigDecimal();

  asset.save();
}
