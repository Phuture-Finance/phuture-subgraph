import { Address, ethereum } from '@graphprotocol/graph-ts';
import { BigDecimal } from '@graphprotocol/graph-ts/index';

import { IndexAsset, UserIndex, Index } from '../../types/schema';
import { ManagedIndex } from '../../types/templates';
import { updateIndexBasePriceByIndex } from '../../utils';
import {
  loadOrCreateAccount,
  loadOrCreateAsset,
  loadOrCreateIndex,
  loadOrCreateIndexAsset,
  loadOrCreateTransaction,
} from '../entities';

export function handleIndexCreation(
  event: ethereum.Event,
  indexAddress: Address,
  assets: Address[],
): Index {
  let tx = loadOrCreateTransaction(event);

  let indexId = indexAddress.toHexString();
  let index = loadOrCreateIndex(indexAddress);

  index.transaction = tx.id;
  index.created = tx.timestamp;

  let paramAssets = assets;
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString();
    let asset = loadOrCreateAsset(paramAssets[i]);

    // asset.indexCount = asset.indexCount.plus(ONE_BI);
    asset._indexes = asset._indexes.concat([index.id]);
    asset.save();

    let indexAssetId = indexId.concat('-').concat(assetId);
    let indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.save();

    index._assets = index._assets.concat([asset.id]);
  }

  index.save();
  updateIndexBasePriceByIndex(index, event.block.timestamp);

  loadOrCreateAccount(event.transaction.from);

  let userIndexId = event.transaction.from
    .toHexString()
    .concat('-')
    .concat(indexAddress.toHexString());
  let userIndex = UserIndex.load(userIndexId);
  if (!userIndex) {
    userIndex = new UserIndex(userIndexId);
    userIndex.index = indexAddress.toHexString();
    userIndex.user = event.transaction.from.toHexString();
    userIndex.balance = BigDecimal.zero();
    userIndex.investedCapital = BigDecimal.zero();
  }
  userIndex.save();

  ManagedIndex.create(indexAddress);

  return index;
}

export function handleAssetRemoved(assetRemovedAddr: Address): void {
  let assetRemoved = loadOrCreateAsset(assetRemovedAddr);

  for (let i = 0; i < assetRemoved._indexes.length; i++) {
    let index = Index.load(assetRemoved._indexes[i]);
    if (!index) {
      continue;
    }

    let indexAsset = loadOrCreateIndexAsset(
      index.id,
      assetRemovedAddr.toHexString(),
    );
    indexAsset.index = null;
    indexAsset.inactiveIndex = index.id;
    indexAsset.save();

    let inactiveAssets = index._inactiveAssets;

    if (inactiveAssets.includes(assetRemoved.id) == false) {
      inactiveAssets.push(assetRemoved.id);
    }

    index._inactiveAssets = inactiveAssets;
    index.save();
  }
}
