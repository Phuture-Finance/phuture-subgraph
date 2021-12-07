import { Asset, Pair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import { convertTokenToDecimal } from '../entities';
import { Address } from '@graphprotocol/graph-ts';

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  let asset0 = Asset.load(pair.asset0);
  if (!asset0) return;

  let asset1 = Asset.load(pair.asset1);
  if (!asset1) return;

  pair.asset0Reserve = convertTokenToDecimal(event.params.reserve0, asset0.decimals);
  pair.asset1Reserve = convertTokenToDecimal(event.params.reserve1, asset1.decimals);

  pair.save();
}

export function handleTransfer(event: Transfer): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  if (event.params.from.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.plus(event.params.value);
  }

  if (event.params.to.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.minus(event.params.value);
  }

  pair.save();
}
