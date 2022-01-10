import { Asset, Pair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import { convertTokenToDecimal } from '../entities';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS } from '../../../consts';

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);
  if (!asset0 || !asset1) return;

  pair.asset0Reserve = new BigDecimal(event.params.reserve0);
  pair.asset1Reserve = new BigDecimal(event.params.reserve1);

  let asset0Reserve = convertTokenToDecimal(event.params.reserve0, asset0.decimals);
  let asset1Reserve = convertTokenToDecimal(event.params.reserve1, asset1.decimals);

  if (asset0.id == BASE_ADDRESS) {
    asset0.basePrice = new BigDecimal(BigInt.fromI32(1));
    asset0.save();

    asset1.basePrice = asset1Reserve.div(asset0Reserve);
    asset1.save();
  }

  if (asset1.id == BASE_ADDRESS) {
    asset1.basePrice = new BigDecimal(BigInt.fromI32(1));
    asset1.save();

    asset0.basePrice = asset0Reserve.div(asset1Reserve);
    asset0.save();
  }

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
