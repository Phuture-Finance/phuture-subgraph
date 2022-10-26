import { Address, BigInt } from '@graphprotocol/graph-ts';
import { IndexBetting } from '../../types/schema';
import { IndexBetting as IndexBettingContract } from '../../types/IndexBetting/IndexBetting';
import { DPI_PRICE_FEED } from '../../../consts';

export function loadOrCreateIndexBetting(addr: Address, ts: BigInt): IndexBetting {
  let id = addr.toHexString();

  let indexBetting = IndexBetting.load(id);
  if (!indexBetting) {
    indexBetting = new IndexBetting(id);
    indexBetting.chainlink = DPI_PRICE_FEED.toLowerCase();
  }

  indexBetting.save();

  return indexBetting as IndexBetting;
}
