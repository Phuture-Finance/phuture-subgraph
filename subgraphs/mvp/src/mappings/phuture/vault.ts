import { Transfer } from "../../types/Vault/Vault";
import { Address } from "@graphprotocol/graph-ts";
import { convertTokenToDecimal, loadOrCreateAsset, loadOrCreateIndexAsset } from "../entities";

export function handleTransfer(event: Transfer): void {
  if (event.params.from.equals(Address.zero())) return;

  let assetId = event.params.asset.toHexString();
  let indexId = event.params.to.toHexString();

  let asset = loadOrCreateAsset(event.params.asset);

  let indexAsset = loadOrCreateIndexAsset(indexId, assetId);
  if (indexAsset == null) return;

  indexAsset.vaultTotalSupply = indexAsset.vaultTotalSupply.plus(
    convertTokenToDecimal(event.params.amount, asset.decimals)
  );

  indexAsset.save();
}
