/* eslint-disable prefer-const */
import { Asset, Pair } from "../types/schema";
import { Address, BigDecimal } from "@graphprotocol/graph-ts/index";
import { factoryContract, ONE_BD, ZERO_BD } from "./helpers";
import { ADDRESS_ZERO, BASE_ADDRESS } from "./consts";

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
