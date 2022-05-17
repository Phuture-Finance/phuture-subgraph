import { ChainLinkAgg } from '../../types/schema';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ChainLinkAssetMap, WETH_ADDRESS } from "../../../consts";
import { AggregatorInterface as AggregatorInterfaceTemplate } from "../../types/templates";
import { ChainLink } from "../../types/templates/AggregatorInterface/ChainLink";
import { convertTokenToDecimal } from "../../utils/calc";

export function loadOrCreateChainLink(addr: Address): ChainLinkAgg {
  let id = addr.toHexString();

  let agg = ChainLinkAgg.load(id);
  if (!agg) {
    //let cl = AggregatorInterface.bind(addr);
    let cl = ChainLink.bind(addr)

    let aggAddr = cl.try_aggregator()
    if (!aggAddr.reverted) {
      AggregatorInterfaceTemplate.create(aggAddr.value);
      agg = new ChainLinkAgg(aggAddr.value.toHexString());
    } else {
      AggregatorInterfaceTemplate.create(addr);
      agg = new ChainLinkAgg(id);
    }

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

// calculateChainLinkPrice returns the price from the aggregator or from the chain of aggregators.
export function calculateChainLinkPrice(agg: ChainLinkAgg): BigDecimal {
  let price = convertTokenToDecimal(agg.answer, agg.decimals);

  if (agg.nextAgg) {
    let nextAgg = loadOrCreateChainLink(Address.fromString(agg.nextAgg as string));
    return price.times(calculateChainLinkPrice(nextAgg));
  }

  return price;
}

export function convertUSDToETH(usdPrice: BigDecimal): BigDecimal {
  let agg = loadOrCreateChainLink(Address.fromString(ChainLinkAssetMap.mustGet(WETH_ADDRESS)));

  return usdPrice.div(convertTokenToDecimal(agg.answer, agg.decimals));
}
