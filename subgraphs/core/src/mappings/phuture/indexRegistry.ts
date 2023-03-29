import { ASSET_ROLE } from '../../../../helpers';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import {
  RoleGranted,
  RoleRevoked,
} from '../../types/IndexRegistry/IndexRegistry';
import { Index } from '../../types/schema';
import {
  Asset as AssetTemplate,
  erc20 as erc20tpl,
} from '../../types/templates';
import {
  SetName,
  SetSymbol,
} from '../../types/templates/ManagedIndex/IndexRegistry';
import { loadOrCreateAsset } from '../entities';

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }
  asset.save();
}

export function handleSetName(event: SetName): void {
  let index = Index.load(event.params.index.toHexString());
  if (!index) return;

  index.name = event.params.name;

  index.save();
}

export function handleSetSymbol(event: SetSymbol): void {
  let index = Index.load(event.params.index.toHexString());
  if (!index) return;
  index.symbol = event.params.name;

  index.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(ASSET_ROLE)) {
    let asset = loadOrCreateAsset(event.params.account);
    asset.isWhitelisted = true;
    asset.save();

    erc20tpl.create(event.params.account);
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(ASSET_ROLE)) {
    let asset = loadOrCreateAsset(event.params.account);
    if (!asset.isWhitelisted) return;

    asset.isWhitelisted = false;
    asset.save();
  }
}
