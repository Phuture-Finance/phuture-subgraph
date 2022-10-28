import { log } from '@graphprotocol/graph-ts';

import { Asset, ChainLinkAggregator } from '../../types/schema';
import { AnswerUpdated } from '../../types/templates/AggregatorInterface/AggregatorInterface';
import { updateIndexBasePriceByAsset } from '../../utils';
import { calculateChainLinkPrice } from '../entities';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let agg = ChainLinkAggregator.load(event.address.toHexString());
  if (!agg) return;

  agg.answer = event.params.current;
  agg.updatedAt = event.params.updatedAt;
  agg.save();

  let asset = Asset.load(agg.asset);
  if (!asset) {
    log.error('cannot find the asset yet: {}', [agg.asset]);
    return;
  }

  asset.basePrice = calculateChainLinkPrice(agg);
  asset.save();

  updateIndexBasePriceByAsset(asset, event.block.timestamp);
}
