import { BigInt } from '@graphprotocol/graph-ts';

// Temporary added to have more smooth charts until hourly is not implemented.
const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 4);

export function getStartingDayTimestamp(timestamp: BigInt): BigInt {
  let dayID = timestamp.div(SECONDS_IN_DAY);

  return dayID.times(SECONDS_IN_DAY);
}
