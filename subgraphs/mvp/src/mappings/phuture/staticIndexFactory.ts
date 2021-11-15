import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { IndexStatic, ONE_BI } from "@phuture/subgraph-helpers";

import { StaticIndexCreated } from "../../types/Index/StaticIndexFactory";
import { IndexAsset, UserIndex } from "../../types/schema";
import { StaticIndex } from "../../types/templates";
import { updateStat } from "./stats";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  loadOrCreateAccount,
  loadOrCreateAsset,
  loadOrCreateIndex,
  loadOrCreateTransaction,
} from "../entities";

export function handleStaticIndexCreated(event: StaticIndexCreated): void {
  let tx = loadOrCreateTransaction(event);

  let indexId = event.params.index.toHexString();
  let index = loadOrCreateIndex(event.params.index);

  index.marketCap = BigDecimal.zero();
  index.baseVolume = BigDecimal.zero();
  index.uniqueHolders = BigInt.zero();
  index.basePrice = BigDecimal.zero();
  index.feeAUM = BigInt.zero();
  index.feeBurn = BigInt.zero();
  index.feeMint = BigInt.zero();
  index._assets = [];
  index.type = IndexStatic;

  let paramAssets = event.params.assets;
  let paramWeights = event.params.weights;
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString();

    let indexAssetId = indexId.concat("-").concat(assetId);

    let indexAsset = new IndexAsset(indexAssetId);
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.weight = BigInt.fromI32(paramWeights[i]);
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

  index.totalSupply = BigInt.zero();
  index.decimals = fetchTokenDecimals(event.params.index);
  index.symbol = fetchTokenSymbol(event.params.index);
  index.name = fetchTokenName(event.params.index);
  index.transaction = tx.id;

  loadOrCreateAccount(event.transaction.from);

  let userIndexId = event.transaction.from.toHexString().concat("-").concat(event.params.index.toHexString());
  let userIndex = UserIndex.load(userIndexId);
  if (userIndex === null) {
    userIndex = new UserIndex(userIndexId);
    userIndex.index = event.params.index.toHexString();
    userIndex.user = event.transaction.from.toHexString();
    userIndex.balance = BigDecimal.zero();
  }

  userIndex.save();

  StaticIndex.create(event.params.index);

  index.save();

  let stat = updateStat(event);
  stat.indexCount = stat.indexCount.plus(ONE_BI);

  stat.save();
}
