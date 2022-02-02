import { ASSET_ROLE } from '@phuture/subgraph-helpers';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import { SetName, SetSymbol } from '../../types/templates/StaticIndex/IndexRegistry';
import { RoleGranted, RoleRevoked } from '../../types/IndexRegistry/IndexRegistry';
import { Index } from '../../types/schema';
import { Asset as AssetTemplate, UniswapPair as UniswapPairTemplate } from '../../types/templates';
import { loadOrCreateAsset, loadOrCreatePair } from '../entities';
import { updateAssetsBasePrice } from '../uniswap/uniswapPair';
import { UniswapFactory } from '../../types/UniswapFactory/UniswapFactory';
import { UniswapPair } from '../../types/templates/UniswapPair/UniswapPair';
import { Address } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS, UNI_FACTORY_ADDRESS } from '../../../consts';

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
  let pairAddr = uni.getPair(baseAddr, event.params.asset);

  if (Address.zero().equals(pairAddr)) return;

  let p = loadOrCreatePair(pairAddr, assetBase.id, asset.id);
  p.save();
  // Track the address of this pair.
  UniswapPairTemplate.create(pairAddr);

  let pair = UniswapPair.bind(pairAddr);
  let reserve = pair.getReserves();

  updateAssetsBasePrice(reserve.value0, reserve.value1, assetBase, asset, event.block.timestamp);
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
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (!event.params.role.equals(ASSET_ROLE)) return;

  let asset = loadOrCreateAsset(event.params.account);
  if (!asset.isWhitelisted) return;

  asset.isWhitelisted = false;
  asset.save();
}
