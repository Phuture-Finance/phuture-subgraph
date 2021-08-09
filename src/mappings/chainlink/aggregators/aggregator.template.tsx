import { AnswerUpdated } from "../../../types/ChainLink/AggregatorInterface";
import { handleAnswerUpdatedForAsset } from "../pairs";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  handleAnswerUpdatedForAsset("{{{address}}}", event);
}
