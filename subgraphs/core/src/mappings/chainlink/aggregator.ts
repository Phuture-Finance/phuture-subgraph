import { log } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from '@phuture/subgraph-helpers';

import { Asset, ChainLinkAggregator, SVVault } from '../../types/schema';
import { AnswerUpdated } from '../../types/templates/AggregatorInterface/AggregatorInterface';
import { updateIndexBasePriceByAsset } from '../../utils';
import {
  updateVaultTotals,
  updateVaultPrice,
  updateVaultAPY,
} from '../../utils/vault';
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

  if (agg.vaults) {
    for (let i = 0; i < agg.vaults.length; i++) {
      if (agg.vaults[i] == ZERO_ADDRESS) {
        return;
      }
      let fVault = SVVault.load(agg.vaults[i]);
      if (fVault) {
        updateVaultTotals(fVault);
        updateVaultAPY(fVault);
        updateVaultPrice(fVault, event.block.timestamp);

        fVault.save();
      }
    }
  }
}
