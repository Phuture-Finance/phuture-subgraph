import { Address, ethereum } from "@graphprotocol/graph-ts";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts/index";
import { IndexStatic, IndexTopN, IndexTracked, ONE_BI } from "@phuture/subgraph-helpers";
import {
  fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, loadOrCreateAccount,
  loadOrCreateAsset,
  loadOrCreateIndex,
  loadOrCreateTransaction,
} from "../entities";
import { IndexAsset, UserIndex } from "../../types/schema";
import { TrackedIndex, TopNMarketCapIndex, StaticIndex } from '../../types/templates'
import { updateStat } from "./stats";

export function handleIndexCreation(type: String, event: ethereum.Event, indexAddress: Address, assets: Address[]): void {
  if (type != IndexTopN || type != IndexStatic || type != IndexTracked) {
    return;
  }

  let tx = loadOrCreateTransaction(event);

  let indexId = indexAddress.toHexString();
  let index = loadOrCreateIndex(indexAddress);

  index.marketCap = BigDecimal.zero();
  index.baseVolume = BigDecimal.zero();
  index.uniqueHolders = BigInt.zero();
  index.basePrice = BigDecimal.zero();
  index._assets = [];
  if (type === IndexTracked) {
    index.type = IndexTracked;
  } else if (type === IndexStatic) {
    index.type = IndexStatic;
  } else if (type === IndexTopN) {
    index.type = IndexTopN;
  }

  if (type !== IndexTopN) {
    let paramAssets = assets;
    for (let i = 0; i < paramAssets.length; i++) {
      let assetId = paramAssets[i].toHexString();

      let indexAssetId = indexId.concat("-").concat(assetId);

      let indexAsset = new IndexAsset(indexAssetId);
      indexAsset.index = indexId;
      indexAsset.asset = assetId;
      indexAsset.basePrice = BigDecimal.zero();
      indexAsset.marketCap = BigDecimal.zero();

      indexAsset.vaultTotalSupply = BigDecimal.zero();

      let asset = loadOrCreateAsset(paramAssets[i]);

      asset.indexCount = asset.indexCount.plus(ONE_BI);
      asset._indexes = asset._indexes.concat([indexAssetId]);
      asset.save();

      indexAsset.save();

      index._assets = index._assets.concat([indexAssetId]);
    }
  }

  index.totalSupply = BigInt.zero();
  index.decimals = fetchTokenDecimals(indexAddress);
  index.symbol = fetchTokenSymbol(indexAddress);
  index.name = fetchTokenName(indexAddress);
  index.transaction = tx.id;

  loadOrCreateAccount(event.transaction.from);

  let userIndexId = event.transaction.from.toHexString().concat("-").concat(indexAddress.toHexString());
  let userIndex = UserIndex.load(userIndexId);
  if (!userIndex) {
    userIndex = new UserIndex(userIndexId);
    userIndex.index = indexAddress.toHexString();
    userIndex.user = event.transaction.from.toHexString();
    userIndex.balance = BigDecimal.zero();
  }

  userIndex.save();

  if (type === IndexTracked) {
    TrackedIndex.create(indexAddress);
  } else if (type === IndexStatic) {
    StaticIndex.create(indexAddress);
  } else if (type === IndexTopN) {
    TopNMarketCapIndex.create(indexAddress);
  }

  index.save();

  let stat = updateStat(event);
  stat.indexCount = stat.indexCount.plus(ONE_BI);

  stat.save();
}
