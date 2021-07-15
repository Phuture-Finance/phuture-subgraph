import { IndexCreated } from "../types/Index/StaticIndexFactory";
import { Index, IndexAsset, UserIndex } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { StaticIndex } from "../types/templates";
import { createTransaction, createUser, fetchTokenName, fetchTokenSymbol, ZERO_BD, ZERO_BI } from "./helpers";

export function handleIndexCreated(event: IndexCreated): void {
  let tx = createTransaction(event);

  let indexId = event.params.index.toHexString();
  let index = new Index(indexId);

  let paramAssets = event.params.assets;
  let paramWeights = event.params.weights;
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString();

    let indexAsset = new IndexAsset(indexId.concat("-").concat(assetId));
    indexAsset.index = indexId;
    indexAsset.asset = assetId;
    indexAsset.weight = BigInt.fromI32(paramWeights[i]);

    indexAsset.vaultTotalSupply = ZERO_BD;

    indexAsset.save();
  }

  // TODO:  ∑_i->n = Vault.balances(assets(i), index) * vaultReserves(assets(i)) / Vault.totalSupplies(assets(i), index) * P(base/asset)
  index.marketCap = ZERO_BD;
  index.totalSupply = ZERO_BI;
  index.symbol = fetchTokenSymbol(event.params.index);
  index.name = fetchTokenName(event.params.index);
  index.indexCount = event.params.indexCount;
  index.transaction = tx.id;

  createUser(event.transaction.from);

  let userIndexId = event.transaction.from.toHexString()
    .concat("-")
    .concat(event.params.index.toHexString());
  let userIndex = UserIndex.load(userIndexId);
  if (userIndex === null) {
    userIndex = new UserIndex(userIndexId);
    userIndex.index = event.params.index.toHexString();
    userIndex.user = event.transaction.from.toHexString();
    userIndex.balance = ZERO_BD;
  }

  userIndex.save();

  StaticIndex.create(event.params.index);

  index.save();
}
