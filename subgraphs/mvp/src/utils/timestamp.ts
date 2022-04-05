const SECONDS_IN_DAY = 86400

export function getStartingDayTimestamp(timestamp: i64): i64 {
  let dayID = timestamp / SECONDS_IN_DAY;
  let dayStartTimestamp = dayID * SECONDS_IN_DAY;

  return dayStartTimestamp;
}

