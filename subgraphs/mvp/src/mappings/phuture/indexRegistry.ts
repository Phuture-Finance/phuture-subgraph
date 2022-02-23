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

import { BASE_ADDRESS, UNI_FACTORY_ADDRESS, SUSHI_FACTORY_ADDRESS } from '../../../consts';
import {updateSushiAssetsBasePrice} from "../sushiswap/pair";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }
  asset.marketCap = event.params.marketCap;
  asset.save();

  let baseAddr = Address.fromString(BASE_ADDRESS);
  if (event.params.asset.equals(baseAddr)) return;

  let assetBase = loadOrCreateAsset(baseAddr);

  let uni = UniswapFactory.bind(Address.fromString(UNI_FACTORY_ADDRESS));
  let pairAddr = uni.try_getPair(baseAddr, event.params.asset);

  if (!pairAddr.reverted && !Address.zero().equals(pairAddr.value)) {
    let p = loadOrCreatePair(pairAddr.value, assetBase.id, asset.id);
    p.save();

    // Track the address of this pair.
    UniswapPairTemplate.create(pairAddr.value);

    let pair = UniswapPair.bind(pairAddr.value);
    let reserve = pair.getReserves();

    updateAssetsBasePrice(reserve.value0, reserve.value1, assetBase, asset, event.block.timestamp);
  }

  // SushiSwap factory
  let sushi = SushiswapFactory.bind(Address.fromString(SUSHI_FACTORY_ADDRESS));
  let sushiPairAddr = sushi.try_getPair(baseAddr, event.params.asset);

  if (!sushiPairAddr.reverted && !Address.zero().equals(sushiPairAddr.value)) {
    log.warning("SUSHI ADDR!: {}", [sushiPairAddr.value.toHexString()]);

    let sp = loadOrCreateSushiPair(sushiPairAddr.value, assetBase.id, asset.id);
    sp.save();

    SushiswapPairTemplate.create(sushiPairAddr.value);

    let spair = SushiswapPair.bind(sushiPairAddr.value);
    let sreserve = spair.getReserves();

    updateSushiAssetsBasePrice(sreserve.value0, sreserve.value1, assetBase, asset, event.block.timestamp);
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
