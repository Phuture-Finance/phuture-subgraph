import { ASSET_ROLE } from '@phuture/subgraph-helpers';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import { SetName, SetSymbol } from '../../types/templates/ManagedIndex/IndexRegistry';
import { RoleGranted, RoleRevoked } from '../../types/IndexRegistry/IndexRegistry';
import { Index } from '../../types/schema';
import {
  Asset as AssetTemplate,
  UniswapPair as UniswapPairTemplate,
  SushiswapPair as SushiswapPairTemplate,
  erc20 as erc20tpl,
} from '../../types/templates';
import { loadOrCreateAsset, loadOrCreatePair, loadOrCreateSushiPair } from '../entities';
import { updateAssetsBasePrice } from '../uniswap/uniswapPair';

import { UniswapFactory } from '../../types/UniswapFactory/UniswapFactory';
import { UniswapPair } from '../../types/templates/UniswapPair/UniswapPair';
import { UniswapFactory as SushiswapFactory } from '../../types/SushiswapFactory/UniswapFactory';
import { UniswapPair as SushiswapPair } from '../../types/templates/SushiswapPair/UniswapPair';
import { Address, log } from '@graphprotocol/graph-ts';

import { UNI_FACTORY_ADDRESS, SUSHI_FACTORY_ADDRESS } from '../../../consts';
import { updateSushiAssetsBasePrice } from "../sushiswap/pair";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }
  asset.marketCap = event.params.marketCap;
  asset.save();

  let bases = [
    Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    Address.fromString("0x6B175474E89094C44Da98b954EedeAC495271d0F"),
    Address.fromString("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    Address.fromString("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"),
    Address.fromString("0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"),
  ];

  for (let i = 0; i < bases.length; i++) {
    let baseAddr = bases[i];

    if (event.params.asset.equals(baseAddr)) continue;

    let assetBase = loadOrCreateAsset(baseAddr);

    let uni = UniswapFactory.bind(Address.fromString(UNI_FACTORY_ADDRESS));
    let pairAddr = uni.try_getPair(baseAddr, event.params.asset);

    if (!pairAddr.reverted && !Address.zero().equals(pairAddr.value)) {
      // Track the address of this pair.
      UniswapPairTemplate.create(pairAddr.value);

      let pair = UniswapPair.bind(pairAddr.value);
      let reserve = pair.getReserves();
      let token0 = pair.token0();
      let token1 = pair.token1();

      let p = loadOrCreatePair(pairAddr.value, token0.toHexString(), token1.toHexString());
      p.asset0 = token0.toHexString();
      p.asset1 = token1.toHexString();
      p.asset0Reserve = reserve.value0.toBigDecimal();
      p.asset1Reserve = reserve.value1.toBigDecimal();
      p.save();

      updateAssetsBasePrice(reserve.value0, reserve.value1, assetBase, asset, event.block.timestamp);
    }

    // SushiSwap factory
    let sushi = SushiswapFactory.bind(Address.fromString(SUSHI_FACTORY_ADDRESS));
    let sushiPairAddr = sushi.try_getPair(baseAddr, event.params.asset);

    if (!sushiPairAddr.reverted && !Address.zero().equals(sushiPairAddr.value)) {
      log.warning("SUSHI ADDR!: {}", [sushiPairAddr.value.toHexString()]);

      SushiswapPairTemplate.create(sushiPairAddr.value);

      let pair = SushiswapPair.bind(sushiPairAddr.value);
      let reserve = pair.getReserves();
      let token0 = pair.token0();
      let token1 = pair.token1();

      let sp = loadOrCreateSushiPair(sushiPairAddr.value, token0.toHexString(), token1.toHexString());
      sp.asset0 = token0.toHexString();
      sp.asset1 = token1.toHexString();
      sp.asset0Reserve = reserve.value0.toBigDecimal();
      sp.asset1Reserve = reserve.value1.toBigDecimal();
      sp.save();

      updateSushiAssetsBasePrice(reserve.value0, reserve.value1, assetBase, asset, event.block.timestamp);
    }
  }
}

export function handleSetName(event: SetName): void {
  let index = Index.load(event.address.toHexString());
  if (!index) return;

  index.name = event.params.name;

  index.save();
}

export function handleSetSymbol(event: SetSymbol): void {
  let index = Index.load(event.address.toHexString());
  if (!index) return;
  index.symbol = event.params.name;

  index.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  if (!event.params.role.equals(ASSET_ROLE)) return;

  let asset = loadOrCreateAsset(event.params.account);
  asset.isWhitelisted = true;
  asset.save();

  erc20tpl.create(event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (!event.params.role.equals(ASSET_ROLE)) return;

  let asset = loadOrCreateAsset(event.params.account);
  if (!asset.isWhitelisted) return;

  asset.isWhitelisted = false;
  asset.save();
}
