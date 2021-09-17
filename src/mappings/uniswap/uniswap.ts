import { PairCreated } from '../../types/UniswapFactory/UniswapFactory'
import { UniswapPair } from '../../types/templates'
import { createAsset, createPair } from '../helpers'

export function handleNewPair(event: PairCreated): void {
  let asset0 = createAsset(event.params.token0)
  let asset1 = createAsset(event.params.token1)

  let pair = createPair(event.params.pair, asset0.id, asset1.id)

  UniswapPair.create(event.params.pair)

  pair.save()
}
