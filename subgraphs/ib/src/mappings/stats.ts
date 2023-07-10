import { PricesHourlyStat } from '../types/schema';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { getStartingTimestamp, SECONDS_IN_HOUR } from '../utils/timestamp';
import { Chainlink } from '../types/UniswapV2Pool/Chainlink';
import { DPI_PRICE_FEED } from '../../consts';

export function updatePricesHourlyStat(txHash: string, ts: BigInt): void {
  let startingHour = getStartingTimestamp(ts, SECONDS_IN_HOUR);
  let stat = PricesHourlyStat.load(startingHour.toString());
  if (!stat) {
    stat = new PricesHourlyStat(startingHour.toString());
    stat.date = startingHour;
  }

  let chainlink = Chainlink.bind(Address.fromString(DPI_PRICE_FEED));
  let chainlinkResponse = chainlink.try_latestRoundData();
  if (!chainlinkResponse.reverted) {
    stat.DPIBasePrice = chainlinkResponse.value.value1;
  }

  stat.save();
}
