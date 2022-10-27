import { Address, BigInt } from '@graphprotocol/graph-ts';
import { IndexBetting } from '../../types/schema';

export function loadOrCreateIndexBetting(addr: Address, ts: BigInt): IndexBetting {
  let id = addr.toHexString();

  let indexBetting = IndexBetting.load(id);
  if (!indexBetting) {
    indexBetting = new IndexBetting(id);
  }

  indexBetting.save();

  return indexBetting as IndexBetting;
}
