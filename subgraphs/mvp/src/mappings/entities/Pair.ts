import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import { Pair, SushiPair } from '../../types/schema';

export function loadOrCreatePair(
  pairAddr: Address,
  address0: string,
  address1: string,
): Pair {
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

  return pair;
}

export function loadOrCreateSushiPair(
  pairAddr: Address,
  address0: string,
  address1: string,
): SushiPair {
  let id = pairAddr.toHexString();

  let sp = SushiPair.load(id);
  if (!sp) {
    sp = new SushiPair(id);

    sp.asset0 = address0;
    sp.asset1 = address1;
    sp.totalSupply = BigInt.zero();
    sp.asset0Reserve = BigDecimal.zero();
    sp.asset1Reserve = BigDecimal.zero();

    sp.save();
  }

  return sp;
}
