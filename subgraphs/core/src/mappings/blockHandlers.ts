import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import { Index, SVVault } from '../types/schema';
import {
  BASE_ADDRESS,
  ChainLinkAssetMap,
  MANAGED_INDEX_FACTORY,
} from '../../consts';
import { IndexFactory } from '../types/schema';
import { updateAllIndexPrices } from '../utils';
import {
  updateVaultAPY,
  updateVaultPrice,
  updateVaultTotals,
} from '../utils/vault';
import { USV } from '../../consts';
import { AggregatorInterface } from '../types/PhuturePriceOracle/AggregatorInterface';
import { convertTokenToDecimal } from '../utils/calc';
import { getBasePrice } from '../utils/pricing';

export function handleBlockUpdatePrices(block: ethereum.Block): void {
  // Update prices only every 10 blocks
  if (!block.number.mod(BigInt.fromI32(10)).equals(BigInt.fromI32(0))) return;

  // Load all the indexes
  let indexFactory = IndexFactory.load(MANAGED_INDEX_FACTORY);
  if (!indexFactory) return;
  let indexes = indexFactory.indexes;
  if (indexes.length == 0) return;

  // Update index and asset prices
  for (let i = 0; i < indexes.length; i++) {
    let index = Index.load(indexes[i]);
    if (!index) {
      log.error('Index not found', [indexes[i]]);
      continue;
    }
    updateAllIndexPrices(index, block.timestamp);
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
