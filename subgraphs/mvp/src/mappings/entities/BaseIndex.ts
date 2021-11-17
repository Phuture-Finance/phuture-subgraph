import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts/index";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "../entities/Asset";
import { Index } from "../../types/schema";

export function loadOrCreateIndex(address: Address): Index {
  let index = Index.load(address.toHexString());

  if (!index) {
    index = new Index(address.toHexString());

    index.marketCap = BigDecimal.zero();
    index.baseVolume = BigDecimal.zero();
    index.uniqueHolders = BigInt.zero();
    index.basePrice = BigDecimal.zero();
    index._assets = [];

    index.totalSupply = BigInt.zero();
    index.decimals = fetchTokenDecimals(address);
    index.symbol = fetchTokenSymbol(address);
    index.name = fetchTokenName(address);

    index.save();
  }

  return index as Index;
}
