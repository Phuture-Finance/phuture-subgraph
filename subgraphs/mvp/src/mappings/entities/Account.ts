import { Address } from "@graphprotocol/graph-ts";
import { User } from "../../types/schema";

export function loadOrCreateAccount(address: Address): void {
  if (address.equals(Address.zero())) {
    return;
  }

  let user = User.load(address.toHexString());

  if (user === null) {
    user = new User(address.toHexString());

    user.save();
  }
}
