import { Address, BigInt } from '@graphprotocol/graph-ts';
import { IndexBetting } from '../../types/schema';
import { IndexBetting as IndexBettingContract } from '../../types/IndexBetting/IndexBetting';

export function loadOrCreateIndexBetting(addr: Address, ts: BigInt): IndexBetting {
  let id = addr.toHexString();

  let indexBetting = IndexBetting.load(id);
  if (!indexBetting) {
    indexBetting = new IndexBetting(id);

    let indexBettingContract = IndexBettingContract.bind(addr);

    let maxStakingAmount = indexBettingContract.try_maxStakingAmount();
    if (!maxStakingAmount.reverted) {
      indexBetting.maxStakingAmount = maxStakingAmount.value;
    }
    indexBetting.save();
  }

  return indexBetting as IndexBetting;
}
