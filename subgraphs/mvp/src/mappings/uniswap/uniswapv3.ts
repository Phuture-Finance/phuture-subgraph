import { log, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';

import { UniswapPathPriceOracle } from '../../types/IndexRegistry/UniswapPathPriceOracle';
import { UniswapV3PriceOracle } from '../../types/IndexRegistry/UniswapV3PriceOracle';
import { UniV3PriceOracle, UniV3PathPriceOracle } from '../../types/schema';
import {
  Burn as BurnEvent,
  Flash as FlashEvent,
  Swap as SwapEvent,
  Initialize,
  Mint as MintEvent,
} from '../../types/templates/Pool/Pool';
import { exponentToBigDecimal } from '../../utils/calc';
import { loadOrCreateAsset } from '../entities';

export function handleInitialize(event: Initialize): void {
  priceUpdate(event.address);
  pricePathUpdate(event.address);
}

export function handleMint(event: MintEvent): void {
  priceUpdate(event.address);
  pricePathUpdate(event.address);
}

export function handleBurn(event: BurnEvent): void {
  priceUpdate(event.address);
  pricePathUpdate(event.address);
}

export function handleFlash(event: FlashEvent): void {
  priceUpdate(event.address);
  pricePathUpdate(event.address);
}

export function handleSwap(event: SwapEvent): void {
  priceUpdate(event.address);
  pricePathUpdate(event.address);
}

export function priceUpdate(a: Address): void {
  let pool = UniV3PriceOracle.load(a.toHexString());
  if (!pool || !pool.priceOracle) {
    log.error('UniV3PriceOracle lastAssetPerBaseInUQ reverted', []);
    return;
  }
  let asset = loadOrCreateAsset(Address.fromString(pool.asset0));
  if (asset.oracle != pool.priceOracle) {
    log.warning('skip the overridden price oracle: {}', [pool.priceOracle]);
    return;
  }

  let po = UniswapV3PriceOracle.bind(Address.fromString(pool.priceOracle));

  let uq = po.try_lastAssetPerBaseInUQ(Address.fromString(pool.asset0));
  if (!uq.reverted) {
    let asset0 = loadOrCreateAsset(Address.fromString(pool.asset0));
    let asset1 = loadOrCreateAsset(Address.fromString(pool.asset1));

    let exp = exponentToBigDecimal(asset0.decimals).div(
      exponentToBigDecimal(asset1.decimals),
    );
    // TODO: move magic number to constants
    asset0.basePrice = new BigDecimal(
      BigInt.fromString('5192296858534827628530496329220096'),
    )
      .div(new BigDecimal(uq.value))
      .times(exp);
    asset0.save();
  }
}

// FIXME: looks like priceUpdate and pricePathUpdate are pretty similar
export function pricePathUpdate(a: Address): void {
  let pPool = UniV3PathPriceOracle.load(a.toHexString());
  if (!pPool || !pPool.pathPriceOracle) {
    log.error('UniV3PriceOracle lastAssetPerBaseInUQ reverted', []);
    return;
  }

  let ppo = UniswapPathPriceOracle.bind(
    Address.fromString(pPool.pathPriceOracle),
  );

  let uq = ppo.try_lastAssetPerBaseInUQ(Address.fromString(pPool.asset0));
  if (!uq.reverted) {
    let asset0 = loadOrCreateAsset(Address.fromString(pPool.asset0));
    let asset1 = loadOrCreateAsset(Address.fromString(pPool.asset1));

    let exp = exponentToBigDecimal(asset0.decimals).div(
      exponentToBigDecimal(asset1.decimals),
    );
    // TODO: move magic number to constants
    asset0.basePrice = new BigDecimal(
      BigInt.fromString('5192296858534827628530496329220096'),
    )
      .div(new BigDecimal(uq.value))
      .times(exp);
    asset0.save();
  }
}
