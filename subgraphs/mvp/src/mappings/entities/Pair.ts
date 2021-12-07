import { Pair } from '../../types/schema';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function loadOrCreatePair(pairAddr: Address, address0: string, address1: string): Pair {
  let id = pairAddr.toHexString();

  let pair = Pair.load(id);
  if (!pair) {
    pair = new Pair(id);
    pair.asset0 = address0;
    pair.asset1 = address1;
    pair.totalSupply = BigInt.zero();
    pair.asset0Reserve = BigDecimal.zero();
    pair.asset1Reserve = BigDecimal.zero();

    pair.save();
  }

  return pair as Pair;
}
