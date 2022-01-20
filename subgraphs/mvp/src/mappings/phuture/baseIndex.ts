import { Address, ethereum } from '@graphprotocol/graph-ts';
import { BigDecimal } from '@graphprotocol/graph-ts/index';
import { IndexStatic, IndexTopN, IndexTracked, ONE_BI } from '@phuture/subgraph-helpers';
import { loadOrCreateAccount, loadOrCreateAsset, loadOrCreateIndex, loadOrCreateTransaction } from '../entities';
import { IndexAsset, UserIndex } from '../../types/schema';
import { TrackedIndex, TopNMarketCapIndex, StaticIndex } from '../../types/templates';
import { updateStat } from './stats';
import { updateIndexBasePriceByIndex } from "../uniswap/uniswapPair";

export function handleIndexCreation(
  type: string,
  event: ethereum.Event,
  indexAddress: Address,
  assets: Address[],
): void {
  let tx = loadOrCreateTransaction(event);

  let indexId = indexAddress.toHexString();
  let index = loadOrCreateIndex(indexAddress);

  index.type = type;
  index.transaction = tx.id;

  let paramAssets = assets;
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString();

    let indexAssetId = indexId.concat('-').concat(assetId);

    let indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.basePrice = BigDecimal.zero();
    indexAsset.marketCap = BigDecimal.zero();

    let asset = loadOrCreateAsset(paramAssets[i]);

    asset.indexCount = asset.indexCount.plus(ONE_BI);
    asset._indexes = asset._indexes.concat([index.id]);
    asset.save();

    indexAsset.save();

    index._assets = index._assets.concat([asset.id]);
  }

  index.save();
  updateIndexBasePriceByIndex(index);

  loadOrCreateAccount(event.transaction.from);

  let userIndexId = event.transaction.from.toHexString().concat('-').concat(indexAddress.toHexString());
  let userIndex = UserIndex.load(userIndexId);
  if (!userIndex) {
    userIndex = new UserIndex(userIndexId);
    userIndex.index = indexAddress.toHexString();
    userIndex.user = event.transaction.from.toHexString();
    userIndex.balance = BigDecimal.zero();
  }
  userIndex.save();

  if (type == IndexTracked) {
    TrackedIndex.create(indexAddress);
  } else if (type == IndexStatic) {
    StaticIndex.create(indexAddress);
  } else if (type == IndexTopN) {
    TopNMarketCapIndex.create(indexAddress);
  }

  let stat = updateStat(event);
  stat.indexCount = stat.indexCount.plus(ONE_BI);
  stat.save();
}
