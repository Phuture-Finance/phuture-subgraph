import { BigInt } from '@graphprotocol/graph-ts/index';

import { UserSVHistory } from '../../types/schema';
import { getStartingDayTimestamp } from '../../utils/timestamp';

export function newUserSVHistory(
  userId: string,
  vaultId: string,
  timestamp: BigInt,
  txLogIndex: BigInt,
): UserSVHistory {
  let id = userId
    .concat('-')
    .concat(vaultId)
    .concat('-')
    .concat(timestamp.toString())
    .concat('-')
    .concat(txLogIndex.toString());

  let history = new UserSVHistory(id);
  history.user = userId;
  history.vault = vaultId;

  history.save();

  return history;
}