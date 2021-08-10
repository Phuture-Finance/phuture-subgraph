import { PairCreated } from "../types/UniswapFactory/UniswapFactory";
import { UniswapPair } from "../types/templates";
import { Sync } from "../types/templates/UniswapPair/UniswapPair";
import { convertTokenToDecimal, createAsset, createPair } from "./helpers";
import { Asset, Pair } from "../types/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleNewPair(event: PairCreated): void {
  let asset0 = createAsset(event.params.token0);
  let asset1 = createAsset(event.params.token1);

  let pair = createPair(event.params.pair, asset0.id, asset1.id);

  UniswapPair.create(event.params.pair);

  pair.save();
}

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);
  log.info(asset0.symbol, []);
  log.info(asset1.symbol, []);

  pair.asset0Reserve = convertTokenToDecimal(event.params.reserve0, asset0.decimals);
  pair.asset1Reserve = convertTokenToDecimal(event.params.reserve1, asset1.decimals);

  pair.save();
}
