import { Address } from '@graphprotocol/graph-ts';

import { STATIC_TYPE } from '../../../../helpers';
import { VTokenCreated as ManagedVTokenCreated } from '../../types/ManagedVTokenFactory/vTokenFactory';
import { vToken } from '../../types/templates';
import { loadOrCreateAsset, loadOrCreateVToken } from '../entities';

export function handleStaticVTokenCreated(event: ManagedVTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.params.vToken);
  vt.asset = event.params.asset.toHexString();
  vt.factory = event.address.toHexString();

  let assetAddr = Address.fromString(vt.asset);
  let asset = loadOrCreateAsset(assetAddr);

  let value = asset._vTokens;

  // TODO: temporary added since we could have issue in contracts where we don't send initial event.
  // vt.platformTotalSupply = BigInt.fromI32(10000);
  vt.tokenType = STATIC_TYPE;
  value = [vt.id].concat(asset._vTokens);

  asset._vTokens = value;
  asset.save();

  // Generate template for monitoring new address.
  vToken.create(event.params.vToken);

  vt.save();
}
