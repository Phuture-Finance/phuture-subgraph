import {ASSET_ROLE, UNI_V3_ORACLE_ROLE, UNI_V3_PATH_ORACLE_ROLE} from '../../../../helpers';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import { SetName, SetSymbol } from '../../types/templates/ManagedIndex/IndexRegistry';
import { RoleGranted, RoleRevoked } from '../../types/IndexRegistry/IndexRegistry';
import { Index, UniV3PathPriceOracle, UniV3PriceOracle} from '../../types/schema';
import {
  Asset as AssetTemplate,
  UniswapPair as UniswapPairTemplate,
  SushiswapPair as SushiswapPairTemplate,
  erc20 as erc20tpl, Pool as PoolTemplate,
} from '../../types/templates';
import {
  loadOrCreateAsset,
  loadOrCreatePair,
  loadOrCreateSushiPair
} from '../entities';

import { UniswapPair } from '../../types/templates/UniswapPair/UniswapPair';
import { UniswapPair as SushiswapPair } from '../../types/templates/SushiswapPair/UniswapPair';
import { UniswapV3PriceOracle } from "../../types/IndexRegistry/UniswapV3PriceOracle";
import {Address, BigDecimal, BigInt, log} from '@graphprotocol/graph-ts';

import {
  UNI_FACTORY_ADDRESS,
  SUSHI_FACTORY_ADDRESS,
  BASE_ASSETS,
} from '../../../consts';
import { updateAssetsBasePrice } from '../uniswap/pair';
import { updateSushiAssetsBasePrice } from '../sushiswap/pair';
import { UniswapPathPriceOracle } from "../../types/IndexRegistry/UniswapPathPriceOracle";
import { exponentToBigDecimal } from "../../utils/calc";

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }
  asset.marketCap = event.params.marketCap;
  asset.save();

  // for (let i = 0; i < BASE_ASSETS.length; i++) {
  //   let baseAddr = Address.fromString(BASE_ASSETS[i]);
  //
  //   if (event.params.asset.equals(baseAddr)) continue;
  //
  //   // Uniswap factory
  //   let uni = UniswapFactory.bind(Address.fromString(UNI_FACTORY_ADDRESS));
  //   let pairAddr = uni.try_getPair(baseAddr, event.params.asset);
  //
  //   if (!pairAddr.reverted && !Address.zero().equals(pairAddr.value)) {
  //     // Track the address of this pair.
  //     UniswapPairTemplate.create(pairAddr.value);
  //
  //     let pair = UniswapPair.bind(pairAddr.value);
  //     let reserve = pair.getReserves();
  //     let token0 = pair.token0();
  //     let token1 = pair.token1();
  //
  //     let p = loadOrCreatePair(pairAddr.value, token0.toHexString(), token1.toHexString());
  //     p.asset0 = token0.toHexString();
  //     p.asset1 = token1.toHexString();
  //     p.asset0Reserve = reserve.value0.toBigDecimal();
  //     p.asset1Reserve = reserve.value1.toBigDecimal();
  //     p.save();
  //
  //     let asset0 = loadOrCreateAsset(token0);
  //     let asset1 = loadOrCreateAsset(token1);
  //
  //      updateAssetsBasePrice(reserve.value0, reserve.value1, asset0, asset1, event.block.timestamp);
  //   }
  //
  //   // SushiSwap factory
  //   let sushi = SushiswapFactory.bind(Address.fromString(SUSHI_FACTORY_ADDRESS));
  //   let sushiPairAddr = sushi.try_getPair(baseAddr, event.params.asset);
  //
  //   if (!sushiPairAddr.reverted && !Address.zero().equals(sushiPairAddr.value)) {
  //     SushiswapPairTemplate.create(sushiPairAddr.value);
  //
  //     let pair = SushiswapPair.bind(sushiPairAddr.value);
  //     let reserve = pair.getReserves();
  //     let token0 = pair.token0();
  //     let token1 = pair.token1();
  //
  //     let sp = loadOrCreateSushiPair(sushiPairAddr.value, token0.toHexString(), token1.toHexString());
  //     sp.asset0 = token0.toHexString();
  //     sp.asset1 = token1.toHexString();
  //     sp.asset0Reserve = reserve.value0.toBigDecimal();
  //     sp.asset1Reserve = reserve.value1.toBigDecimal();
  //     sp.save();
  //
  //     let asset0 = loadOrCreateAsset(token0);
  //     let asset1 = loadOrCreateAsset(token1);
  //
  //     updateSushiAssetsBasePrice(reserve.value0, reserve.value1, asset0, asset1, event.block.timestamp);
  //   }
  // }
}

export function handleSetName(event: SetName): void {
  let index = Index.load(event.params.index.toHexString());
  if (!index) return;

  index.name = event.params.name;

  index.save();
}

export function handleSetSymbol(event: SetSymbol): void {
  let index = Index.load(event.params.index.toHexString());
  if (!index) return;
  index.symbol = event.params.name;

  index.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(ASSET_ROLE)) {
    let asset = loadOrCreateAsset(event.params.account);
    asset.isWhitelisted = true;
    asset.save();

    erc20tpl.create(event.params.account);

    // UNI_V3_ORACLE_ROLE handling.
  } else if (event.params.role.equals(UNI_V3_ORACLE_ROLE)) {
    let po = UniswapV3PriceOracle.bind(event.params.account);
    let tPool = po.try_pool();
    if (!tPool.reverted) {
      let oracle = new UniV3PriceOracle(tPool.value.toHexString());
      let asset0 = po.asset0();
      let asset1 = po.asset1();

      oracle.asset0 = asset0.toHexString();
      oracle.asset1 = asset1.toHexString();
      oracle.priceOracle = event.params.account.toHexString();
      oracle.save();

      let a0 = loadOrCreateAsset(asset0);
      let a1 = loadOrCreateAsset(asset1);
      let dt = po.try_lastAssetPerBaseInUQ(asset0)
      if (!dt.reverted) {
        let exp = exponentToBigDecimal(a0.decimals).div(exponentToBigDecimal(a1.decimals));
        a0.basePrice = new BigDecimal(BigInt.fromString('5192296858534827628530496329220096')).div(new BigDecimal(dt.value)).times(exp);
      }
      a0.oracle = event.params.account.toHexString();
      a0.save();

      PoolTemplate.create(tPool.value);
    } else {
      log.error("failed get pool on address: {}", [event.params.account.toHexString()]);
    }

    // UNI_V3_PATH_ORACLE_ROLE handling.
  } else if (event.params.role.equals(UNI_V3_PATH_ORACLE_ROLE)) {
    let ppo = UniswapPathPriceOracle.bind(event.params.account);

    let tAnatomy = ppo.try_anatomy();
    if (!tAnatomy.reverted) {
      let asset0 = tAnatomy.value.value0[tAnatomy.value.value0.length-1];
      let asset1 = tAnatomy.value.value0[0];

      for (let i = 0; i < tAnatomy.value.value1.length; i++) {
        let pOracle = new UniV3PathPriceOracle(tAnatomy.value.value1[i].toHexString());
        pOracle.asset0 = asset0.toHexString();
        pOracle.asset1 = asset1.toHexString();
        pOracle.pathPriceOracle = event.params.account.toHexString();
        pOracle.save();

        PoolTemplate.create(tAnatomy.value.value1[i]);
      }

      let dt = ppo.try_lastAssetPerBaseInUQ(tAnatomy.value.value0[tAnatomy.value.value0.length-1]);
      if (!dt.reverted) {
        let a0 = loadOrCreateAsset(asset0);
        let a1 = loadOrCreateAsset(asset1);

        let exp = exponentToBigDecimal(a0.decimals).div(exponentToBigDecimal(a1.decimals));
        a0.basePrice = new BigDecimal(BigInt.fromString('5192296858534827628530496329220096')).div(new BigDecimal(dt.value)).times(exp);
        a0.oracle = event.params.account.toHexString();
        a0.save();
      }

    } else {
      log.error("failed get anatomy on address: {}", [event.params.account.toHexString()]);
    }
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(ASSET_ROLE)) {
    let asset = loadOrCreateAsset(event.params.account);
    if (!asset.isWhitelisted) return;

    asset.isWhitelisted = false;
    asset.save();
  }
}
