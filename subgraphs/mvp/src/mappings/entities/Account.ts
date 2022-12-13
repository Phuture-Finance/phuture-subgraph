import { Address } from '@graphprotocol/graph-ts';

import { User, SVUser } from '../../types/schema';

export function loadOrCreateAccount(address: Address): void {
  if (address.equals(Address.zero())) return;

  let account = User.load(address.toHexString());
  if (!account) {
    new User(address.toHexString()).save();
  }
}

export function loadOrCreateSVAccount(address: Address): void {
  if (address.equals(Address.zero())) return;

  let account = SVUser.load(address.toHexString());
  if (!account) {
    new SVUser(address.toHexString()).save();
  }
}
