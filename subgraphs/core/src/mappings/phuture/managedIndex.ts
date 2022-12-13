import { Transfer as TransferEvent } from '../../types/templates/ManagedIndex/ManagedIndex';
import { UpdateAnatomy } from '../../types/templates/ManagedIndex/ManagedIndex';

import { handleAllIndexesTransfers } from './transfer';
import { updateAnatomy } from './updateAnatomy';

export function handleManagedIndexTransfer(event: TransferEvent): void {
  handleAllIndexesTransfers(
    event,
    event.params.from,
    event.params.to,
    event.params.value,
  );
}

export function handleUpdateAnatomy(event: UpdateAnatomy): void {
  updateAnatomy(
    event.address,
    event.params.asset,
    event.params.weight,
    event.block.timestamp,
  );
}
