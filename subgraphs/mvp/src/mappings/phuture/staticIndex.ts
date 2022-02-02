import { handleAllIndexesTransfers } from './transfer';
import { Transfer as TransferEvent } from '../../types/templates/StaticIndex/StaticIndex';
import { UpdateAnatomy } from '../../types/templates/StaticIndex/StaticIndex';
import { updateAnatomy } from './updateAnatomy';

export function handleStaticIndexTransfer(event: TransferEvent): void {
  handleAllIndexesTransfers(event, event.params.from, event.params.to, event.params.value);
}

export function handleUpdateAnatomy(event: UpdateAnatomy): void {
  updateAnatomy(event.address, event.params.asset, event.params.weight, event.block.timestamp);
}
