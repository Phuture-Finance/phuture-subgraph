import { AnswerUpdated } from '../../types/templates/AggregatorInterface/AggregatorInterface';
import { Asset, ChainLinkAgg } from '../../types/schema';
import { log } from '@graphprotocol/graph-ts';
import { convertTokenToDecimal } from '../entities';
import { updateCapVToken, updateIndexBasePriceByAsset } from "../../utils";

export function handleAnswerUpdated(event: AnswerUpdated): void {
    let agg = ChainLinkAgg.load(event.address.toHexString());
    if (!agg) return;

    agg.answer = event.params.current;
    agg.updatedAt = event.params.updatedAt;
    agg.save();

    let asset = Asset.load(agg.asset);
    if (!asset) {
        log.error('can not find the asset', [agg.asset])
        return;
    }

    asset.basePrice = convertTokenToDecimal(event.params.current, agg.decimals);
    asset.save();

    updateIndexBasePriceByAsset(asset, event.block.timestamp);
    updateCapVToken(asset);
}

