import { Address, BigInt } from '@graphprotocol/graph-ts';

import { vToken } from '../../types/schema';

export function loadOrCreateVToken(address: Address): vToken {
  let id = address.toHexString();
  let vt = vToken.load(id);
  if (!vt) {
    vt = new vToken(id);
    vt.deposited = BigInt.zero();
    vt.platformTotalSupply = BigInt.zero();
  }

  return vt as vToken;
}

export function loadVToken(address: Address): vToken | null {
  let id = address.toHexString();

  return vToken.load(id);
}
