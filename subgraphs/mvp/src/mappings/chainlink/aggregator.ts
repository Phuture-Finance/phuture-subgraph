import {AnswerUpdated} from '../../types/templates/AggregatorInterface/AggregatorInterface';
import {Asset, ChainLinkAgg, SVVault} from '../../types/schema';
import {log} from '@graphprotocol/graph-ts';
import {calculateChainLinkPrice} from "../entities";
import {updateIndexBasePriceByAsset} from "../../utils";
import {updateVaultTotals, updateVaultPrice, updateVaultAPY} from "../../utils/vault";

export function handleAnswerUpdated(event: AnswerUpdated): void {
    let agg = ChainLinkAgg.load(event.address.toHexString());
    if (!agg) return;

    agg.answer = event.params.current;
    agg.updatedAt = event.params.updatedAt;
    agg.save();

    let asset = Asset.load(agg.asset);
    if (!asset) {
        log.error('can not find the asset yet: {}', [agg.asset])
        return;
    }

    asset.basePrice = calculateChainLinkPrice(agg);
    asset.save();

    updateIndexBasePriceByAsset(asset, event.block.timestamp);

    if (agg.vaults) {
        for (let i = 0; i < agg.vaults.length; i++) {
            let fVault = SVVault.load(agg.vaults[i]);
            if (fVault) {
                updateVaultTotals(fVault);
                updateVaultAPY(fVault);
                updateVaultPrice(fVault, event.block.timestamp);

                fVault.save();
            }
        }
    }
}
