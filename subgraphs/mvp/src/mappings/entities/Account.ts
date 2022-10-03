import { Address } from '@graphprotocol/graph-ts';
import { User, SVUser } from '../../types/schema';

export function loadOrCreateAccount(address: Address): void {
  if (address.equals(Address.zero())) {
    return;
  }

  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());

    user.save();
  }
}

export function loadOrCreateSVAccount(address: Address): void {
  if (address.equals(Address.zero())) {
    return;
  }

  let user = SVUser.load(address.toHexString());

  if (!user) {
    user = new SVUser(address.toHexString());

    user.save();
  }
}
