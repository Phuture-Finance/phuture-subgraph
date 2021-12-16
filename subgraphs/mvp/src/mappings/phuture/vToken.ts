import { UpdateDeposit } from '../../types/vToken/vToken';
import { loadOrCreateVToken } from '../entities';

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.save();
}
