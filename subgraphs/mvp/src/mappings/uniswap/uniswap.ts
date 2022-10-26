import { PairCreated } from '../../types/UniswapFactory/UniswapFactory';
import { DEX } from '../../types/schema';
import { SUSHI_FACTORY_ADDRESS, SUSHI_ROUTER_ADDRESS, UNI_FACTORY_ADDRESS, UNI_ROUTER_ADDRESS } from '../../../consts';
import { Address } from '@graphprotocol/graph-ts';

export function handleNewPair(event: PairCreated): void {
  let dx = DEX.load(event.address.toHexString());
  if (!dx) {
    dx = new DEX(event.address.toHexString());
    if (event.address.equals(Address.fromString(UNI_FACTORY_ADDRESS))) {
      dx.type = 'uniswap';
      dx.router = UNI_ROUTER_ADDRESS.toLowerCase();
      dx.save();
    } else if (event.address.equals(Address.fromString(SUSHI_FACTORY_ADDRESS))) {
      dx.type = 'sushiswap';
      dx.router = SUSHI_ROUTER_ADDRESS.toLowerCase();
      dx.save();
    }
  }
}
