import { VTokenCreated } from '../../types/vToken/vTokenFactory';
import { Address } from '@graphprotocol/graph-ts';
import { loadOrCreateAsset, loadOrCreateVToken } from '../entities';
import { DYNAMIC_TYPE, DYNAMIC_TYPE_HASH, STATIC_TYPE, STATIC_TYPE_HASH } from '@phuture/subgraph-helpers';

export function handleVTokenCreated(event: VTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.params.vToken);
  vt.asset = event.params.asset.toHexString();

  let assetAddr = Address.fromString(vt.asset);
  let asset = loadOrCreateAsset(assetAddr);

  let value = asset._vTokens;

  if (event.params.vTokenType == STATIC_TYPE_HASH) {
    vt.tokenType = STATIC_TYPE;
    value = [vt.id].concat(asset._vTokens);
  } else if (event.params.vTokenType == DYNAMIC_TYPE_HASH) {
    vt.tokenType = DYNAMIC_TYPE;
    value.push(vt.id);
  }

  asset._vTokens = value;
  asset.save();

  vt.save();
}
