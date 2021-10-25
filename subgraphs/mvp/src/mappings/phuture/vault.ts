import { Transfer } from "../../types/Vault/Vault";
import { convertTokenToDecimal, createAsset } from "../helpers";
import { IndexAsset } from "../../types/schema";
import { ADDRESS_ZERO } from "../../../consts";

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() === ADDRESS_ZERO) return;

  let assetId = event.params.asset.toHexString();
  let indexId = event.params.to.toHexString();

  let asset = createAsset(event.params.asset);

  let indexAsset = IndexAsset.load(
    indexId
      .concat("-")
      .concat(assetId)
  );
  if (indexAsset == null) return;

  indexAsset.vaultTotalSupply = indexAsset.vaultTotalSupply
    .plus(convertTokenToDecimal(event.params.amount, asset.decimals));

  indexAsset.save();
}
