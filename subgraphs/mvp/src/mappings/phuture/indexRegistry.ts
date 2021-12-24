import { ASSET_ROLE } from '@phuture/subgraph-helpers';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import { Transfer } from '../../types/templates/Asset/Asset';
import { SetName, SetSymbol } from '../../types/templates/StaticIndex/IndexRegistry';
import { RoleGranted, RoleRevoked } from '../../types/IndexRegistry/IndexRegistry';
import { Asset, Index } from '../../types/schema';
import { Asset as AssetTemplate } from '../../types/templates';
import { convertTokenToDecimal, loadOrCreateAsset, loadVToken } from '../entities';

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }

  asset.save();
}

export function handleTransfer(event: Transfer): void {}

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
