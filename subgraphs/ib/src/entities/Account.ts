import { Address } from '@graphprotocol/graph-ts';
import { IndexBettingUser } from "../types/schema";

export function loadOrCreateIndexBettingUser(address: Address): void {
  if (address.equals(Address.zero())) {
    return;
  }

  let user = IndexBettingUser.load(address.toHexString());

  if (!user) {
    user = new IndexBettingUser(address.toHexString());

    user.save();
  }
}
