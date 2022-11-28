import { BigInt } from '@graphprotocol/graph-ts';
import { UserIndexHistory } from '../../types/schema';

export function newUserIndexHistory(
  userID: string,
  indexID: string,
  timestamp: BigInt,
  txLogIndex: BigInt,
): UserIndexHistory {
  let id = userID
    .concat('-')
    .concat(indexID)
    .concat('-')
    .concat(timestamp.toString())
    .concat('-')
    .concat(txLogIndex.toString());

  let userIndexHistory = new UserIndexHistory(id);
  userIndexHistory.user = userID;
  userIndexHistory.index = indexID;
  userIndexHistory.save();

  return userIndexHistory;
}
