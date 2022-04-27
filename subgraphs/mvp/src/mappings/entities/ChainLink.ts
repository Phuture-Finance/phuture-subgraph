import { ChainLinkAgg } from '../../types/schema';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ChainLinkAssetMap, WETH_ADDRESS } from "../../../consts";
import { AggregatorInterface as AggregatorInterfaceTemplate } from "../../types/templates";
import { AggregatorInterface } from "../../types/templates/AggregatorInterface/AggregatorInterface";
import {convertTokenToDecimal } from "../../utils/calc";

export function loadOrCreateChainLink(addr: Address): ChainLinkAgg {
  let id = addr.toHexString();

  let agg = ChainLinkAgg.load(id);
  if (!agg) {
    AggregatorInterfaceTemplate.create(addr);
    let cl = AggregatorInterface.bind(addr);

    agg = new ChainLinkAgg(id);
    agg.answer = cl.latestAnswer();
    agg.decimals = BigInt.fromI32(cl.decimals());
    agg.description = cl.description();

    if (agg.description.substring(agg.description.length-3, agg.description.length) == "ETH") {
      agg.nextAgg = ChainLinkAssetMap.mustGet(WETH_ADDRESS);
    }

    agg.save();
  }

  return agg as ChainLinkAgg;
}

export function calculateChainLinkPrice(agg: ChainLinkAgg): BigDecimal {
  let price = convertTokenToDecimal(agg.answer, agg.decimals);

  if (agg.nextAgg) {
    let nextAgg = loadOrCreateChainLink(Address.fromString(agg.nextAgg as string));
    return price.times(calculateChainLinkPrice(nextAgg));
  }

  return price;
}
