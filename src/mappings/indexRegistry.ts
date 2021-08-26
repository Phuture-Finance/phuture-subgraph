import { RemoveAsset, UpdateAsset } from "../types/IndexRegistry/IndexRegistry";
import { convertTokenToDecimal, createAsset, ZERO_BI } from "./helpers";
import { Transfer } from "../types/templates/Asset/Asset";
import { Asset, Index, IndexStat, LM, Reward } from '../types/schema'
import { Asset as AssetTemplate } from "../types/templates";
import { EMISSION_ADDRESS, FACTORY_ADDRESS, LM_ADDRESS, VAULT_ADDRESS } from "../consts";
import { updateDailyAssetStat, updateStat } from "./stats";
import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = createAsset(event.params.asset);

  asset.prev = event.params.prev.toHexString();
  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);

    asset.isWhitelisted = true;
  }

  asset.save();
}

export function handleRemoveAsset(event: RemoveAsset): void {
  let asset = createAsset(event.params.asset);

  asset.prev = event.params.prev.toHexString();
  asset.marketCap = ZERO_BI;
  asset.isWhitelisted = false;

  asset.save();
}

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() == EMISSION_ADDRESS && event.params.to.toHexString() == LM_ADDRESS) {
    let id = event.block.number.toString();
    let reward = Reward.load(id);
    if (reward == null) {
      reward = new Reward(id);
      reward.amount = event.params.value;

      reward.save();
    }

    let lm = LM.load(FACTORY_ADDRESS);
    if (lm == null) {
      lm = new LM(FACTORY_ADDRESS);
      lm.APR = BigInt.fromI32(0).toBigDecimal();
      lm.totalReward = event.params.value;
    } else {
      lm.totalReward = lm.totalReward.plus(event.params.value);
    }

    lm.save();
  }

  if (event.params.to.toHexString() != VAULT_ADDRESS) return;

  let asset = Asset.load(event.address.toHexString()) as Asset;
  asset.vaultReserve = asset.vaultReserve.plus(convertTokenToDecimal(event.params.value, asset.decimals));
  asset.vaultBaseReserve = asset.vaultReserve.times(asset.basePrice);

  asset.save();

  let stat = updateStat(event);
  stat.totalValueLocked = stat.totalValueLocked.plus(
    convertTokenToDecimal(event.params.value, asset.decimals).times(asset.basePrice)
  );
  stat.save();

  // let indexes = asset.indexes;
  // for (let i = 0; i < indexes.length; i++) {
  //   let allTimeIndexStat = IndexStat.load(indexes[i].toString());
  //   allTimeIndexStat.basePrice = asset.basePrice;
  //   allTimeIndexStat.baseVolume = new BigDecimal(asset.marketCap);
  // }

  updateDailyAssetStat(event);
}
