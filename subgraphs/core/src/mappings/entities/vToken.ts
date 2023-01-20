import { Address, BigInt } from '@graphprotocol/graph-ts';

import { vToken as vTokenEntity } from '../../types/schema';

export function loadOrCreateVToken(address: Address): vTokenEntity {
  let id = address.toHexString();

  let vToken = vTokenEntity.load(id);
  if (!vToken) {
    vToken = new vTokenEntity(id);

    vToken.deposited = BigInt.zero();
    vToken.platformTotalSupply = BigInt.zero();
    vToken.depositedPercentage = BigInt.zero();

    vToken.save();
  }

  return vToken;
}
