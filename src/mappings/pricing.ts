/* eslint-disable prefer-const */
import { Asset, Pair } from "../types/schema";
import { Address, BigDecimal } from "@graphprotocol/graph-ts/index";
import { ADDRESS_ZERO, factoryContract, ONE_BD, ZERO_BD } from "./helpers";

const BASE_ADDRESS = "0xa191bcbd21f3e36670f65d3e2153a8df3299df2c";

export function findBASEPerAsset(asset: Asset): BigDecimal {
  if (asset.id == BASE_ADDRESS) {
    return ONE_BD;
  }

  let pairAddress = factoryContract.getPair(Address.fromString(BASE_ADDRESS), Address.fromString(asset.id));

  if (pairAddress.toHexString() != ADDRESS_ZERO) {
    let pair = Pair.load(pairAddress.toHexString());

    if (pair.asset0 == asset.id) {
      return pair.asset1Price;
    }

    if (pair.asset1 == asset.id) {
      return pair.asset0Price;
    }
  }

  return ZERO_BD;
}
