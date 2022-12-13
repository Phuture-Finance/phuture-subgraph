import { updatePricesHourlyStat } from './stats';
import { Swap } from '../types/UniswapV2Pool/UniswapPair';
import { log } from '@graphprotocol/graph-ts';

export function handleSwap(event: Swap): void {
  updatePricesHourlyStat(event.transaction.hash.toHexString(), event.block.timestamp);
}