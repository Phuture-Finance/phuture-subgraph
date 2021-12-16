import { Transfer, UpdateDeposit } from '../../types/vToken/vToken';
import { Address } from '@graphprotocol/graph-ts';
import { loadOrCreateVToken } from '../entities';

export function handlerTransfer(event: Transfer): void {
  if (event.address.equals(Address.zero())) return;
}

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.save();
}
