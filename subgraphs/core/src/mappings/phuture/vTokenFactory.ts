import { Address } from '@graphprotocol/graph-ts';

import { VTokenCreated as ManagedVTokenCreated } from '../../types/ManagedVTokenFactory/vTokenFactory';
import { vToken as vTokenEntity } from '../../types/templates';
import { loadOrCreateAsset, loadOrCreateVToken } from '../entities';

export function handleStaticVTokenCreated(event: ManagedVTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vToken = loadOrCreateVToken(event.params.vToken);
  vToken.asset = event.params.asset.toHexString();
  vToken.factory = event.address.toHexString();

  let assetAddress = Address.fromString(vToken.asset);
  let asset = loadOrCreateAsset(assetAddress);

  // TODO: temporary added since we could have issue in contracts where we don't send initial event.
  // vt.platformTotalSupply = BigInt.fromI32(10000);
  asset._vTokens = [vToken.id].concat(asset._vTokens);

  asset.save();

  // Generate a template for monitoring new address.
  vTokenEntity.create(event.params.vToken);

  vToken.save();
}
