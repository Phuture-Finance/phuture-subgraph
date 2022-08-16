import { ChainLink, ChainLinkAgg } from '../../types/schema';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ChainLinkAssetMap, BNA_ADDRESS } from "../../../consts";
import { AggregatorInterface as AggregatorInterfaceTemplate } from "../../types/templates";
import { ChainLink as ChainLinkAggTemplate } from "../../types/templates/AggregatorInterface/ChainLink";
import { convertTokenToDecimal } from "../../utils/calc";

export function loadOrCreateChainLink(addr: Address): ChainLinkAgg {
  let id = addr.toHexString();
  let cl = ChainLinkAggTemplate.bind(addr);

  let chl = ChainLink.load(id);
  if (!chl) {
    chl = new ChainLink(id);

    let aggAddr = cl.try_aggregator()
    if (!aggAddr.reverted) {
      AggregatorInterfaceTemplate.create(aggAddr.value);

      chl.aggregator = aggAddr.value.toHexString();
    }
    chl.save();
  }

  let agg = ChainLinkAgg.load(chl.aggregator);
  if (!agg && chl.aggregator) {
    agg = new ChainLinkAgg(chl.aggregator);
    agg.chainLink = id;

    let answer = cl.try_latestAnswer();
    if (!answer.reverted) {
      agg.answer = answer.value;
    }

    let decimals = cl.try_decimals();
    if (!decimals.reverted) {
      agg.decimals = BigInt.fromI32(decimals.value);
    }

    let description = cl.try_description();
    if (!description.reverted) {
      agg.description = description.value;
    }

    if (agg.description.substring(agg.description.length - 3, agg.description.length) == "ETH") {
      agg.nextAgg = ChainLinkAssetMap.mustGet(BNA_ADDRESS);
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
  let agg = loadOrCreateChainLink(Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)));
  if (!agg.asset) {
    agg.asset = BNA_ADDRESS;
    agg.save()
  }

  return usdPrice.div(convertTokenToDecimal(agg.answer, agg.decimals));
}
