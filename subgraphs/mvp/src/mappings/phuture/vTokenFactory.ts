import { Address } from '@graphprotocol/graph-ts';
import { loadOrCreateAsset, loadOrCreateVToken } from '../entities';
import { DYNAMIC_TYPE, STATIC_TYPE } from '@phuture/subgraph-helpers';
import { VTokenCreated as ManagedVTokenCreated } from '../../types/ManagedVTokenFactory/vTokenFactory';
import { VTokenCreated as DynamicVTokenCreated } from '../../types/DynamicVTokenFactory/vTokenFactory';
import { vToken } from '../../types/templates';

export function handleDynamicVTokenCreated(event: DynamicVTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.params.vToken);
  vt.asset = event.params.asset.toHexString();

  let assetAddr = Address.fromString(vt.asset);
  let asset = loadOrCreateAsset(assetAddr);

  let value = asset._vTokens;

  vt.tokenType = DYNAMIC_TYPE;
  value.push(vt.id);

  asset._vTokens = value;
  asset.save();

  // Generate template for monitoring new address.
  vToken.create(event.params.vToken);

  vt.save();
}

export function handleStaticVTokenCreated(event: ManagedVTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.params.vToken);
  vt.asset = event.params.asset.toHexString();

  let assetAddr = Address.fromString(vt.asset);
  let asset = loadOrCreateAsset(assetAddr);

  let value = asset._vTokens;

  vt.tokenType = STATIC_TYPE;
  value = [vt.id].concat(asset._vTokens);

  asset._vTokens = value;
  asset.save();

  // Generate template for monitoring new address.
  vToken.create(event.params.vToken);

  vt.save();
}
