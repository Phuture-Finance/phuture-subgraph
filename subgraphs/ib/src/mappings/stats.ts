import { IndexBetting, IndexBettingDailyStat, PricesHourlyStat } from '../types/schema';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { IndexBetting as IndexBettingContract } from '../types/IndexBetting/IndexBetting';
import { getStartingTimestamp, SECONDS_IN_DAY } from '../utils/timestamp';
import { IndexHelper } from '../types/UniswapV2Pool/IndexHelper';
import { ChainLink } from '../types/templates/AggregatorInterface/ChainLink';
import { DPI_PRICE_FEED, INDEX_HELPER, PDI } from '../../consts';

export function updateIndexBettingDailyStat(indexBetting: IndexBetting, ts: BigInt): IndexBettingDailyStat {
  let startingDay = getStartingTimestamp(ts, SECONDS_IN_DAY);

  let stat = IndexBettingDailyStat.load(indexBetting.id.concat('-').concat(startingDay.toString()));
  if (!stat) {
    stat = new IndexBettingDailyStat(indexBetting.id.concat('-').concat(startingDay.toString()));
    stat.date = startingDay;
    stat.indexBetting = indexBetting.id;
  }

  let indexBettingContract = IndexBettingContract.bind(Address.fromString(indexBetting.id));
  let PDIBasePrice = indexBettingContract.try_getLatestPDIPrice();
  if (!PDIBasePrice.reverted) {
    stat.PDIBasePrice = PDIBasePrice.value;
  }
  let DPIBasePrice = indexBettingContract.try_getLatestDPIPrice();
  if (!DPIBasePrice.reverted) {
    stat.DPIBasePrice = DPIBasePrice.value;
  }

  // used for testing purposes
  // stat.PDIBasePrice = BigInt.fromI32(860000);
  // stat.DPIBasePrice = BigInt.fromI32(870000);

  stat.save();
  return stat as IndexBettingDailyStat;
}

export function updatePricesHourlyStat(txHash: string, ts: BigInt): void {
  let startingHour = getStartingTimestamp(ts, BigInt.fromI32(60));
  log.info('startingHour: {}', [startingHour.toString()]);
  let stat = PricesHourlyStat.load(startingHour.toString());
  log.info('stat: {}', [stat ? stat.id : 'null']);
  if (!stat) {
    stat = new PricesHourlyStat(startingHour.toString());
    stat.date = startingHour;
  }

  let indexHelper = IndexHelper.bind(Address.fromString(INDEX_HELPER));
  let indexHelperResponse = indexHelper.try_totalEvaluation(Address.fromString(PDI));
  if (!indexHelperResponse.reverted) {
    stat.PDIBasePrice = indexHelperResponse.value.value1.times(BigInt.fromI32(100));
  }
  let chainlink = ChainLink.bind(Address.fromString(DPI_PRICE_FEED));
  let chainlinkResponse = chainlink.try_latestRoundData();
  if (!chainlinkResponse.reverted) {
    stat.DPIBasePrice = chainlinkResponse.value.value1;
  }
  // stat.PDIBasePrice = BigInt.fromI32(86000000);
  // stat.DPIBasePrice = BigInt.fromI32(88000000);

  stat.save();
}
