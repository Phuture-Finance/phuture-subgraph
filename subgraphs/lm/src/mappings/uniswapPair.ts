import { Address, BigInt } from '@graphprotocol/graph-ts';

import { LP, PHTR, USDC } from '../../consts';
import { Reserve } from '../types/schema';
import { Sync, Transfer } from '../types/UniswapPair/UniswapPair';

export function handleSync(event: Sync): void {
  let reserve = Reserve.load(LP);
  if (reserve == null) {
    reserve = new Reserve(LP);
    reserve.token0 = USDC;
    reserve.token1 = PHTR;
    reserve.token0Decimals = BigInt.fromI32(6);
    reserve.token1Decimals = BigInt.fromI32(18);
    reserve.totalSupply = BigInt.zero();
  }

  reserve.reserve0 = event.params.reserve0;
  reserve.reserve1 = event.params.reserve1;

  reserve.save();
}

export function handleTransfer(event: Transfer): void {
  let reserve = Reserve.load(LP);
  if (reserve == null) {
    reserve = new Reserve(LP);
    reserve.token0 = USDC;
    reserve.token1 = PHTR;
    reserve.token0Decimals = BigInt.fromI32(6);
    reserve.token1Decimals = BigInt.fromI32(18);
    reserve.reserve0 = BigInt.zero();
    reserve.reserve1 = BigInt.zero();
    reserve.totalSupply = BigInt.zero();
  }

  if (event.params.from.equals(Address.zero())) {
    reserve.totalSupply = reserve.totalSupply.plus(event.params.value);
  }

  if (event.params.to.equals(Address.zero())) {
    reserve.totalSupply = reserve.totalSupply.minus(event.params.value);
  }

  reserve.save();
}
