import { Transfer } from "../types/Vault/Vault";
import { convertTokenToDecimal } from "./helpers";
import { Asset, IndexAsset } from "../types/schema";
import { ADDRESS_ZERO } from "./consts";

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() === ADDRESS_ZERO) return;

  let assetId = event.params.asset.toHexString();

  let asset = Asset.load(assetId);

  let indexAsset = IndexAsset.load(
    event.params.to.toHexString()
      .concat("-")
      .concat(assetId)
  );
  indexAsset.vaultTotalSupply = indexAsset.vaultTotalSupply.plus(convertTokenToDecimal(event.params.amount, asset.decimals));

  indexAsset.save();
}
