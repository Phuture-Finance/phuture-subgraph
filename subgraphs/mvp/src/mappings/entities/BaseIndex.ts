import { Address } from "@graphprotocol/graph-ts/index";
import { Index } from "../../types/schema";

export function loadOrCreateIndex(address: Address): Index {
  let index = Index.load(address.toHexString());

  if (!index) {
    index = new Index(address.toHexString());
    index.save();
  }

  return index as Index;
}
