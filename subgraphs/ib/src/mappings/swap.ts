import { updatePricesHourlyStat } from './stats';
import { Swap } from '../types/UniswapV2Pool/UniswapPair';

export function handleSwap(event: Swap): void {
  updatePricesHourlyStat(event.transaction.hash.toHexString(), event.block.timestamp);
}
