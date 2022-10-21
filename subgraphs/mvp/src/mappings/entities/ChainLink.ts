import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import { ChainLinkAssetMap, BNA_ADDRESS } from '../../../consts';
import { AggregatorInterface } from '../../types/ChainlinkPriceOracle/AggregatorInterface';
import { ChainLink, ChainLinkAgg } from '../../types/schema';
import { AggregatorInterface as AggregatorInterfaceTemplate } from '../../types/templates';
import { ChainLink as ChainLinkAggTemplate } from '../../types/templates/AggregatorInterface/ChainLink';
import { convertTokenToDecimal } from '../../utils/calc';

export function loadOrCreateChainLinkAgg(addr: Address): ChainLinkAgg {
  let aggregatorContract = AggregatorInterface.bind(addr);

  let aggregator = ChainLinkAgg.load(addr.toHexString());
  if (!aggregator) {
    aggregator = new ChainLinkAgg(addr.toHexString());

    let answer = aggregatorContract.try_latestAnswer();
    if (!answer.reverted) {
      aggregator.answer = answer.value;
    }

    let decimals = aggregatorContract.try_decimals();
    if (!decimals.reverted) {
      aggregator.decimals = BigInt.fromI32(decimals.value);
    }

    let description = aggregatorContract.try_description();
    if (!description.reverted) {
      aggregator.description = description.value;
    }

    if (
      aggregator.description.substring(
        aggregator.description.length - 3,
        aggregator.description.length,
      ) == 'ETH'
    ) {
      let nextAgg = loadOrCreateChainLink(
        Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)),
      );
      aggregator.nextAgg = nextAgg.id;
    }

    aggregator.vaults = [];
  }

  return aggregator;
}

export function loadOrCreateChainLink(addr: Address): ChainLinkAgg {
  let id = addr.toHexString();
  let aggregatorContract = ChainLinkAggTemplate.bind(addr);

  let chainlink = ChainLink.load(id);
  if (!chainlink) {
    chainlink = new ChainLink(id);

    let aggregatorAddress = aggregatorContract.try_aggregator();
    if (!aggregatorAddress.reverted) {
      AggregatorInterfaceTemplate.create(aggregatorAddress.value);
      chainlink.aggregator = aggregatorAddress.value.toHexString();
    }

    chainlink.save();
  }

  let aggregator = loadOrCreateChainLinkAgg(
    Address.fromString(chainlink.aggregator),
  );
  aggregator.chainLink = id;
  aggregator.save();

  return aggregator;
}

// returns the price from the aggregator or from the chain of aggregators.
export function calculateChainLinkPrice(aggregator: ChainLinkAgg): BigDecimal {
  let price = convertTokenToDecimal(aggregator.answer, aggregator.decimals);

  if (aggregator.nextAgg) {
    let nextAggregator = loadOrCreateChainLinkAgg(
      Address.fromString(aggregator.nextAgg as string),
    );

    return price.times(calculateChainLinkPrice(nextAggregator));
  }

  return price;
}

export function convertUSDToETH(usdPrice: BigDecimal): BigDecimal {
  let aggregator = loadOrCreateChainLink(
    Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)),
  );
  if (!aggregator.asset) {
    aggregator.asset = BNA_ADDRESS;
    aggregator.save();
  }

  return usdPrice.div(
    convertTokenToDecimal(aggregator.answer, aggregator.decimals),
  );
}
