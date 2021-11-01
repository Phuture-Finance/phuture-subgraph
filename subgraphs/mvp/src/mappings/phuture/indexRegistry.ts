import { UpdateAsset } from "../../types/IndexRegistry/IndexRegistry";
import { convertTokenToDecimal, createAsset } from "../helpers";
import { Transfer } from "../../types/templates/Asset/Asset";
import { SetImageURL, SetName, SetSymbol } from "../../types/templates/StaticIndex/IndexRegistry";
import { Asset, Index } from "../../types/schema";
import { Asset as AssetTemplate } from "../../types/templates";
import { VAULT_ADDRESS } from "../../../consts";
import { updateDailyAssetStat, updateStat } from "./stats";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = createAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);

    asset.isWhitelisted = true;
  }

  asset.save();
}

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() != VAULT_ADDRESS) return;

  let asset = Asset.load(event.address.toHexString());
  if (asset === null) return;

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
