import { Address } from "@graphprotocol/graph-ts";
import { User } from "../../types/schema";

export function loadOrCreateAccount(address: Address): void {
  if (Address.zero().equals(address)) {
    return;
  }

  let user = User.load(address.toHexString());

  if (user === null) {
    user = new User(address.toHexString());

    user.save();
  }
}
