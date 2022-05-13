import { AssetAdded } from '../../types/ChainlinkPriceOracle/ChainlinkPriceOracle';
import {calculateChainLinkPrice, loadOrCreateAsset, loadOrCreateChainLink} from "../entities";
import { ChainLinkAgg } from "../../types/schema";

export function handleAssetAdded(event: AssetAdded): void {
    let asset = loadOrCreateAsset(event.params._asset);
    let prevAgg: ChainLinkAgg | null = null;

    for (let i = 0; i < event.params._aggregators.length; i++) {
        let agg = loadOrCreateChainLink(event.params._aggregators[i]);
        if (prevAgg != null) {
            prevAgg.nextAgg = agg.id;
            prevAgg.save();
        }
        prevAgg = agg;
    }

    let agg = loadOrCreateChainLink(event.params._aggregators[0]);
    agg.asset = event.params._asset.toHexString();
    agg.save();

    asset.basePrice = calculateChainLinkPrice(agg);
    asset.save();
}
