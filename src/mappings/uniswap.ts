import { PairCreated } from "../types/UniswapFactory/UniswapFactory";
import { UniswapPair } from "../types/templates";
import { Sync } from "../types/templates/UniswapPair/UniswapPair";
import { convertTokenToDecimal, createAsset, createPair, ZERO_BD } from "./helpers";
import { Asset, Pair } from "../types/schema";
import { findBASEPerAsset } from "./pricing";

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

  pair.asset0Reserve = convertTokenToDecimal(event.params.reserve0, asset0.decimals);
  pair.asset1Reserve = convertTokenToDecimal(event.params.reserve1, asset1.decimals);

  if (pair.asset1Reserve.notEqual(ZERO_BD)) pair.asset0Price = pair.asset0Reserve.div(pair.asset1Reserve);
  else pair.asset0Price = ZERO_BD;

  if (pair.asset0Reserve.notEqual(ZERO_BD)) pair.asset1Price = pair.asset1Reserve.div(pair.asset0Reserve);
  else pair.asset1Price = ZERO_BD;

  pair.save();

  asset0.basePrice = findBASEPerAsset(asset0 as Asset);
  asset1.basePrice = findBASEPerAsset(asset1 as Asset);

  pair.save();
  asset0.save();
  asset1.save();
}
