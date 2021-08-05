import { RemoveAsset, UpdateAsset } from "../types/IndexRegistry/IndexRegistry";
import { convertTokenToDecimal, createAsset, ZERO_BI } from "./helpers";
import { Transfer } from "../types/templates/Asset/Asset";
import { Asset } from "../types/schema";
import { Asset as AssetTemplate } from "../types/templates";
import { VAULT_ADDRESS } from "./consts";
import { updateDailyAssetStat, updateStat } from "./stats";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = createAsset(event.params.asset);

  asset.prev = event.params.prev.toHexString();
  asset.marketCap = event.params.marketCap;
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
  if (event.params.to.toHexString() != VAULT_ADDRESS) return;

  let asset = Asset.load(event.address.toHexString());
  asset.vaultReserve = asset.vaultReserve.plus(convertTokenToDecimal(event.params.value, asset.decimals));
  asset.vaultBaseReserve = asset.vaultReserve.times(asset.basePrice);

  asset.save();

  let stat = updateStat(event);
  stat.totalValueLocked = stat.totalValueLocked.plus(
    convertTokenToDecimal(event.params.value, asset.decimals).times(asset.basePrice)
  );
  stat.save();

  updateDailyAssetStat(event, asset);
}
