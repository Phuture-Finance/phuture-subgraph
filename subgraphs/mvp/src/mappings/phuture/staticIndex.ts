import { handleAllIndexesTransfers } from "./transfer";
import { Transfer as TransferEvent } from "../../types/templates/StaticIndex/StaticIndex";

export function handleStaticIndexTransfer(event: TransferEvent): void {
  handleAllIndexesTransfers(event);
}
