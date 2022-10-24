import { AnswerUpdated } from '../../types/AggregatorInterface/AggregatorInterface';
import {ChainLink, IndexBetting} from "../../types/schema";
import {updateIndexBettingDailyStat} from "../stats";

export function handleAnswerUpdated(event: AnswerUpdated): void {
    let chainlink = ChainLink.load(event.address.toHexString());
    if (!chainlink) return;
    let indexBetting = IndexBetting.load(chainlink.indexBetting);
    if (!indexBetting) return;
    updateIndexBettingDailyStat(indexBetting, event.block.timestamp);
}
