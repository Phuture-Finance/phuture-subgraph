import {BigInt} from "@graphprotocol/graph-ts";

const SECONDS_IN_DAY = BigInt.fromI32(86400)

export function getStartingDayTimestamp(timestamp: BigInt): BigInt {
  let dayID = timestamp.div(SECONDS_IN_DAY);

  return dayID.times(SECONDS_IN_DAY);
}

