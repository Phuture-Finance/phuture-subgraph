import { handleAllIndexesTransfers } from "./transfer";
import { Transfer as TrackedIndexTransferEvent } from "../../types/templates/TrackedIndex/TrackedIndex";

export function handleTrackedIndexTransfer(event: TrackedIndexTransferEvent): void {
  handleAllIndexesTransfers(event);
}
