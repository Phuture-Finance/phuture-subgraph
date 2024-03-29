import { Transfer as TransferEntity, User } from '../../types/schema';
import { Transfer } from '../../types/IndexBetting/IndexBetting';

export function createTransfer(event: Transfer, transferType: string): void {
  let transfer = new TransferEntity(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString()));
  transfer.indexBetting = event.address.toHexString();
  transfer.from = event.params.from.toHexString();
  transfer.to = event.params.to.toHexString();
  transfer.amount = event.params.value;
  transfer.type = transferType;
  transfer.timestamp = event.block.timestamp;

  transfer.save();
}
