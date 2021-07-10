/* eslint-disable prefer-const */
import { Asset, Pair } from '../types/schema'
import { Address, BigDecimal } from '@graphprotocol/graph-ts/index'
import { ADDRESS_ZERO, factoryContract, ONE_BD, ZERO_BD } from './helpers'

const USDC_ADDRESS = '0x9e2b499b478add23f738d74a2b1c30a88b94307b'

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findUSDCPerToken(asset: Asset): BigDecimal {
  if (asset.id == USDC_ADDRESS) {
    return ONE_BD
  }

  let pairAddress = factoryContract.getPair(Address.fromString(USDC_ADDRESS), Address.fromString(asset.id))

  if (pairAddress.toHexString() != ADDRESS_ZERO) {
    let pair = Pair.load(pairAddress.toHexString())

    if (pair.asset0 == asset.id) {
      return pair.asset1Price
    }

    if (pair.asset1 == asset.id) {
      return pair.asset0Price
    }
  }

  return ZERO_BD // nothing was found return 0
}
