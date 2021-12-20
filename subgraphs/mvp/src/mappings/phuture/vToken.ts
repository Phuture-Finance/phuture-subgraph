// @ts-ignore
import { UpdateDeposit, VTokenTransfer } from '../../types/vToken/vToken';
import { loadOrCreateVToken, loadVToken } from '../entities';

export function handlerVTokenTransfer(event: VTokenTransfer): void {
  let fromVToken = loadVToken(event.params.from);
  if (fromVToken) {
    fromVToken.platformTotalSupply -= event.params.amount;
    fromVToken.save();
  }

  let toVToken = loadVToken(event.params.to);
  if (toVToken) {
    toVToken.platformTotalSupply += event.params.amount;
    toVToken.save();
  }
}

export function handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.save();
}
