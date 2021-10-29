import { UpdateAsset } from "../../types/IndexRegistry/IndexRegistry";
import { convertTokenToDecimal, createAsset } from "../helpers";
import { Transfer } from "../../types/templates/Asset/Asset";
import { SetImageURL, SetName, SetSymbol } from "../../types/templates/StaticIndex/IndexRegistry";
import { Asset, LM, Reward, Index } from "../../types/schema";
import { Asset as AssetTemplate } from "../../types/templates";
import { EMISSION_ADDRESS, FACTORY_ADDRESS, LM_ADDRESS, VAULT_ADDRESS } from "../../../consts";
import { updateDailyAssetStat, updateStat } from "./stats";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = createAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);

    asset.isWhitelisted = true;
  }

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

  updateDailyAssetStat(event);
}

export function handleSetImageURL(event: SetImageURL): void {
  let index = Index.load(event.address.toHexString());
  if (!index) return;
  index.imageUrl = event.params.name;

  index.save();
}

export function handleSetName(event: SetName): void {
  let index = Index.load(event.address.toHexString());
  if (!index) return;

  index.name = event.params.name;

  index.save();
}

export function handleSetSymbol(event: SetSymbol): void {
  let index = Index.load(event.address.toHexString());
  if (!index) return;
  index.symbol = event.params.name;

  index.save();
}
