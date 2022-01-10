import { PairCreated } from '../../types/UniswapFactory/UniswapFactory';
import { UniswapPair } from '../../types/templates';
import { loadOrCreatePair, loadOrCreateAsset } from '../entities';
import { WHITELIST_ASSETS } from '../../../consts';

export function handleNewPair(event: PairCreated): void {
  if (
    !WHITELIST_ASSETS.includes(event.params.token0.toHexString()) ||
    !WHITELIST_ASSETS.includes(event.params.token1.toHexString())
  ) {
    return;
  }

  let asset0 = loadOrCreateAsset(event.params.token0);
  let asset1 = loadOrCreateAsset(event.params.token1);

  if (asset0 && asset1) {
    let pair = loadOrCreatePair(event.params.pair, asset0.id, asset1.id);
    UniswapPair.create(event.params.pair);

    pair.save();
  }
}
