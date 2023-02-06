import { Swap } from '../types/UniswapV2Pool/UniswapPair';

import { updatePricesHourlyStat } from './stats';

export function handleSwap(event: Swap): void {
  updatePricesHourlyStat(
    event.transaction.hash.toHexString(),
    event.block.timestamp,
  );
}
