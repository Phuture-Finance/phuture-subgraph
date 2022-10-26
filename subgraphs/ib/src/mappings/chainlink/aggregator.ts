import { AnswerUpdated } from '../../types/templates/AggregatorInterface/AggregatorInterface';
import { ChainlinkAggregator, IndexBetting, Chainlink } from '../../types/schema';
import { updateIndexBettingDailyStat } from '../stats';
import { log } from '@graphprotocol/graph-ts';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let chainlinkAggregator = ChainlinkAggregator.load(event.address.toHexString());
  if (!chainlinkAggregator) return;
  let chainlink = Chainlink.load(chainlinkAggregator.chainlink);
  if (!chainlink) return;
  let indexBetting = IndexBetting.load(chainlink.indexBetting);
  if (!indexBetting) return;
  updateIndexBettingDailyStat(indexBetting, event.block.timestamp);
}
