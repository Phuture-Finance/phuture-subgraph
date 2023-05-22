import { AssetAdded } from '../../types/ChainlinkPriceOracle/ChainlinkPriceOracle';
import { ChainLink, ChainLinkAggregator } from '../../types/schema';
import {
  calculateChainLinkPrice,
  loadOrCreateAsset,
  loadOrCreateChainLink,
  loadOrCreateChainLinkAgg,
} from '../entities';
import { ConfirmAggregatorCall } from '../../types/templates/ChainlinkTemplate/ChainLink';
import { store } from '@graphprotocol/graph-ts';
import { AggregatorInterface as AggregatorInterfaceTemplate } from '../../types/templates';

export function handleAssetAdded(event: AssetAdded): void {
  let asset = loadOrCreateAsset(event.params._asset);
  let prevAggregator: ChainLinkAggregator | null = null;

  for (let i = 0; i < event.params._aggregators.length; i++) {
    let nextAggregator = loadOrCreateChainLink(event.params._aggregators[i]);
    if (prevAggregator != null) {
      prevAggregator.nextAgg = nextAggregator.id;
      prevAggregator.save();
    }

    prevAggregator = nextAggregator;
  }

  let aggregator = loadOrCreateChainLink(event.params._aggregators[0]);
  aggregator.asset = event.params._asset.toHexString();
  aggregator.save();

  asset.basePrice = calculateChainLinkPrice(aggregator);
  asset.save();
}

export function handleConfirmAggregator(call: ConfirmAggregatorCall): void {
  let chainlink = ChainLink.load(call.to.toHexString());
  if (chainlink) {
    let aggregator = call.inputs._aggregator;
    // delete the aggregator for the oracle
    store.remove('ChainLinkAggregator', chainlink.aggregator);

    AggregatorInterfaceTemplate.create(aggregator);
    chainlink.aggregator = aggregator.toHexString();

    loadOrCreateChainLinkAgg(aggregator);
  }
}
