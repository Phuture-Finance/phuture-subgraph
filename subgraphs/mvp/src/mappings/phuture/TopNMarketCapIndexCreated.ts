import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'
import { IndexTracked, ONE_BI } from '@phuture/subgraph-helpers'
import { Index, UserIndex } from "../../types/schema";
import {
  fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, loadOrCreateAccount, loadOrCreateTransaction,
} from '../entities'
import { updateStat } from './stats'
import { TopNMarketCapIndexCreated } from '../../types/TopNMarketCapIndexFactory/TopNMarketCapIndexFactory'

export function handleTopNMarketCapIndexCreated(event: TopNMarketCapIndexCreated): void {
  let tx = loadOrCreateTransaction(event);

  let indexId = event.params.index.toHexString();
  let index = new Index(indexId);

  index.marketCap = BigDecimal.zero();
  index.baseVolume = BigDecimal.zero();
  index.uniqueHolders = BigInt.zero();
  index.basePrice = BigDecimal.zero();
  index._assets = [];
  index.type = IndexTracked;

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

  // TODO: create after transfer handler implementation.
  // StaticIndex.create(event.params.index);

  index.save();

  let stat = updateStat(event);
  stat.indexCount = stat.indexCount.plus(ONE_BI);

  stat.save();
}
