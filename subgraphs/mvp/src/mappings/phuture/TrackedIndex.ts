import { Transfer as TrackedIndexTransferEvent, UpdateAnatomy } from '../../types/templates/TrackedIndex/TrackedIndex';
import { handleAllIndexesTransfers } from './transfer';
import { updateAnatomy } from './updateAnatomy';

export function handleTrackedIndexTransfer(event: TrackedIndexTransferEvent): void {
  handleAllIndexesTransfers(event, event.params.from, event.params.to, event.params.value);
}

export function handleUpdateAnatomy(event: UpdateAnatomy): void {
  updateAnatomy(event.address, event.params.asset, event.params.weight);
}
