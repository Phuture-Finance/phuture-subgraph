import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';

import { ChainLinkAssetMap, BNA_ADDRESS } from '../../../consts';
import { AggregatorInterface } from '../../types/ChainlinkPriceOracle/AggregatorInterface';
import { ChainLink, ChainLinkAggregator } from '../../types/schema';
import { AggregatorInterface as AggregatorInterfaceTemplate } from '../../types/templates';
import { ChainLink as ChainLinkAggTemplate } from '../../types/templates/AggregatorInterface/ChainLink';
import { convertTokenToDecimal } from '../../utils/calc';

export function loadOrCreateChainLinkAgg(addr: Address): ChainLinkAggregator {
  let aggregatorContract = AggregatorInterface.bind(addr);

  let aggregator = ChainLinkAggregator.load(addr.toHexString());
  if (!aggregator) {
    aggregator = new ChainLinkAggregator(addr.toHexString());

    log.info('aggregatorContract.try_latestAnswer: {}', [addr.toString()]);
    let answer = aggregatorContract.try_latestAnswer();
    log.info('aggregatorContract.try_latestAnswer is success: {}', [
      (!answer.reverted).toString(),
    ]);
    if (!answer.reverted) {
      aggregator.answer = answer.value;
    }

    log.info('aggregatorContract.try_decimals: {}', [addr.toString()]);
    let decimals = aggregatorContract.try_decimals();
    log.info('aggregatorContract.try_decimals is success: {}', [
      (!decimals.reverted).toString(),
    ]);
    if (!decimals.reverted) {
      aggregator.decimals = BigInt.fromI32(decimals.value);
    }

    log.info('aggregatorContract.try_description: {}', [addr.toString()]);
    let description = aggregatorContract.try_description();
    log.info('aggregatorContract.try_description is success: {}', [
      (!description.reverted).toString(),
    ]);
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

export function loadOrCreateChainLink(addr: Address): ChainLinkAggregator {
  let id = addr.toHexString();
  let aggregatorContract = ChainLinkAggTemplate.bind(addr);

  let chainlink = ChainLink.load(id);
  if (!chainlink) {
    chainlink = new ChainLink(id);

    log.info('Calling aggregatorContract.try_aggregator(): {}', [
      addr.toString(),
      id,
    ]);
    let aggregatorAddress = aggregatorContract.try_aggregator();
    log.info('aggregatorContract.try_aggregator() call is success: {}', [
      (!aggregatorAddress.reverted).toString(),
    ]);
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
export function calculateChainLinkPrice(
  aggregator: ChainLinkAggregator,
): BigDecimal {
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
