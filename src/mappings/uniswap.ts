import { PairCreated } from '../types/Uniswap/Uniswap'
import { Pair as PairTemplate } from '../types/templates'
import { Sync } from '../types/templates/Pair/Pair'
import { convertTokenToDecimal, createAsset, createPair, ZERO_BD } from './helpers'
import { Asset, Pair } from '../types/schema'
import { findUSDCPerToken } from './pricing'

export function handleNewPair(event: PairCreated): void {
  let asset0 = createAsset(event.params.token0)
  let asset1 = createAsset(event.params.token1)

  let pair = createPair(event.params.pair, asset0.id, asset1.id)

  PairTemplate.create(event.params.pair)

  asset0.save()
  asset1.save()
  pair.save()
}

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString())
  let asset0 = Asset.load(pair.asset0)
  let asset1 = Asset.load(pair.asset1)

  pair.reserve0 = convertTokenToDecimal(event.params.reserve0, asset0.decimals)
  pair.reserve1 = convertTokenToDecimal(event.params.reserve1, asset1.decimals)

  if (pair.reserve1.notEqual(ZERO_BD)) pair.asset0Price = pair.reserve0.div(pair.reserve1)
  else pair.asset0Price = ZERO_BD

  if (pair.reserve0.notEqual(ZERO_BD)) pair.asset1Price = pair.reserve1.div(pair.reserve0)
  else pair.asset1Price = ZERO_BD

  pair.save()

  asset0.priceUSDC = findUSDCPerToken(asset0 as Asset)
  asset1.priceUSDC = findUSDCPerToken(asset1 as Asset)

  pair.save()
  asset0.save()
  asset1.save()
}
