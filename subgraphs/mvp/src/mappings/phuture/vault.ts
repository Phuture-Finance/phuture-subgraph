import { Transfer } from "../../types/Vault/Vault";
import { IndexAsset } from "../../types/schema";
import { Address } from "@graphprotocol/graph-ts";
import { convertTokenToDecimal, loadOrCreateAsset } from "../entities";

export function handleTransfer(event: Transfer): void {
  if (event.params.from.equals(Address.zero())) return;

  let assetId = event.params.asset.toHexString();
  let indexId = event.params.to.toHexString();

  let asset = loadOrCreateAsset(event.params.asset);

  let indexAsset = IndexAsset.load(indexId.concat("-").concat(assetId));
  if (indexAsset == null) return;

  indexAsset.vaultTotalSupply = indexAsset.vaultTotalSupply.plus(
    convertTokenToDecimal(event.params.amount, asset.decimals)
  );

  indexAsset.save();
}
