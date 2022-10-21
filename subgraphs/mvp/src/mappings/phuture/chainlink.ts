import { AssetAdded } from '../../types/ChainlinkPriceOracle/ChainlinkPriceOracle';
import { ChainLinkAgg } from '../../types/schema';
import {
  calculateChainLinkPrice,
  loadOrCreateAsset,
  loadOrCreateChainLink,
} from '../entities';

export function handleAssetAdded(event: AssetAdded): void {
  let asset = loadOrCreateAsset(event.params._asset);
  let prevAggregator: ChainLinkAgg | null = null;

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
