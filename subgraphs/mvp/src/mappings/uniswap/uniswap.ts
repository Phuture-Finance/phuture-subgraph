import { PairCreated } from '../../types/UniswapFactory/UniswapFactory';
import { UniswapPair } from '../../types/templates';
import { loadOrCreateAsset, loadOrCreatePair } from '../entities';

export function handleNewPair(event: PairCreated): void {
  let asset0 = loadOrCreateAsset(event.params.token0);
  let asset1 = loadOrCreateAsset(event.params.token1);

  let pair = loadOrCreatePair(event.params.pair, asset0.id, asset1.id);

  UniswapPair.create(event.params.pair);

  pair.save();
}
