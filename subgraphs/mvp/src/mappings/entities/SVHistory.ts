import { BigInt } from '@graphprotocol/graph-ts/index';

import { UserSVHistory, DailyUserSVHistory } from '../../types/schema';
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

export function loadOrCreateDailyUserSVHistory(
  userId: string,
  vaultId: string,
  timestamp: BigInt,
): DailyUserSVHistory {
  let id = userId
    .concat('-')
    .concat(vaultId)
    .concat('-')
    .concat(getStartingDayTimestamp(timestamp).toString());

  let dailySVHistory = DailyUserSVHistory.load(id);

  if (!dailySVHistory) {
    dailySVHistory = new DailyUserSVHistory(id);

    dailySVHistory.timestamp = getStartingDayTimestamp(timestamp);
    dailySVHistory.user = userId;
    dailySVHistory.vault = vaultId;

    dailySVHistory.save();
  }

  return dailySVHistory;
}
