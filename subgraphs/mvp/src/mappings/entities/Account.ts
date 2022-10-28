import { Address } from '@graphprotocol/graph-ts';

import { User } from '../../types/schema';

export function loadOrCreateAccount(address: Address): void {
  if (address.equals(Address.zero())) return;

  let account = User.load(address.toHexString());
  if (!account) {
    new User(address.toHexString()).save();
  }
}
