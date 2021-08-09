/* eslint-disable prefer-const */
import { Asset } from "../types/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts/index";
import { BASE_ADDRESS, CHAINLINK_ADDRESS } from "./consts";
import { ChainLink } from "../types/ChainLink/ChainLink"
import { BigDecimal } from '@graphprotocol/graph-ts'


export function findBASEPerAsset(asset: Asset): BigDecimal {
  let chainLinkAddress = Address.fromString(CHAINLINK_ADDRESS);
  let baseAddress = Address.fromString(BASE_ADDRESS);
  let assetAddress = Address.fromString(asset.id);

  let contract = ChainLink.bind(chainLinkAddress);
  let result = contract.try_latestRoundData(baseAddress, assetAddress);
  let answer: BigInt = null;
  if (result.reverted) {
    result = contract.try_latestRoundData(baseAddress, assetAddress);
    // Double time broken block, stop execution
    if (result.reverted) {
      return asset.basePrice;
    }
  }
  // value1 - answer (pair price)
  answer = result.value.value1;
  // Return price for asset
  return answer.toBigDecimal();
}
