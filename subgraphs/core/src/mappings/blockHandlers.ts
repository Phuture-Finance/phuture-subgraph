import { BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import { Index, SVVault } from '../types/schema';
import { MANAGED_INDEX_FACTORY } from '../../consts';
import { IndexFactory } from '../types/schema';
import { updateAllIndexPrices } from '../utils';
import {
  updateVaultAPY,
  updateVaultPrice,
  updateVaultTotals,
} from '../utils/vault';
import { USV } from '../../consts';
import { getBasePrice } from '../utils/pricing';

export function handleBlockUpdatePrices(block: ethereum.Block): void {
  // Update prices only every 10 blocks
  if (!block.number.mod(BigInt.fromI32(10)).equals(BigInt.fromI32(0))) return;

  // Update index prices
  let indexFactory = IndexFactory.load(MANAGED_INDEX_FACTORY);
  if (indexFactory != null && indexFactory.indexes.length != 0) {
    // Update index and asset prices
    for (let i = 0; i < indexFactory.indexes.length; i++) {
      let index = Index.load(indexFactory.indexes[i]);
      if (!index) {
        log.error('Index not found', [indexFactory.indexes[i]]);
        continue;
      }
      updateAllIndexPrices(index, block.timestamp);
    }
  }

  // Update USV related pricing
  let usdcSavingsVault = SVVault.load(USV);
  if (usdcSavingsVault) {
    let basePrice = getBasePrice();

    updateVaultTotals(usdcSavingsVault, basePrice);
    updateVaultAPY(usdcSavingsVault, block.number);
    updateVaultPrice(usdcSavingsVault, basePrice, block.timestamp);

    usdcSavingsVault.save();
  }
}
