import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';

import {
  ASSET_ROLE,
  UNI_V3_ORACLE_ROLE,
  UNI_V3_PATH_ORACLE_ROLE,
} from '../../../../helpers';
import { BASE_ASSETS } from '../../../consts';
import { UpdateAsset } from '../../types/IndexRegistry/IndexRegistry';
import {
  RoleGranted,
  RoleRevoked,
} from '../../types/IndexRegistry/IndexRegistry';
import { UniswapPathPriceOracle } from '../../types/IndexRegistry/UniswapPathPriceOracle';
import { UniswapV3PriceOracle } from '../../types/IndexRegistry/UniswapV3PriceOracle';
import {
  Index,
  UniV3PathPriceOracle,
  UniV3PriceOracle,
} from '../../types/schema';
import {
  Asset as AssetTemplate,
  erc20 as erc20tpl,
  Pool as PoolTemplate,
} from '../../types/templates';
import {
  SetName,
  SetSymbol,
} from '../../types/templates/ManagedIndex/IndexRegistry';
import { exponentToBigDecimal } from '../../utils/calc';
import { loadOrCreateAsset } from '../entities';

export function handleUpdateAsset(event: UpdateAsset): void {
  let asset = loadOrCreateAsset(event.params.asset);

  if (!asset.isWhitelisted) {
    AssetTemplate.create(event.params.asset);
  }
  asset.save();
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
    let priceOracleContract = UniswapV3PriceOracle.bind(event.params.account);

    let tPool = priceOracleContract.try_pool();
    if (tPool.reverted) {
      log.error('failed get pool on address: {}', [
        event.params.account.toHexString(),
      ]);
    } else {
      let oracle = new UniV3PriceOracle(tPool.value.toHexString());

      let asset0 = priceOracleContract.asset0();
      let asset1 = priceOracleContract.asset1();
      if (BASE_ASSETS.includes(asset0.toHexString().toLowerCase())) {
        asset0 = priceOracleContract.asset1();
        asset1 = priceOracleContract.asset0(); // stable coin must be always asset1.
      }

      oracle.asset0 = asset0.toHexString();
      oracle.asset1 = asset1.toHexString();
      oracle.priceOracle = event.params.account.toHexString();
      oracle.save();

      let a0 = loadOrCreateAsset(asset0);
      let a1 = loadOrCreateAsset(asset1);
      let dt = priceOracleContract.try_lastAssetPerBaseInUQ(asset0);
      if (!dt.reverted) {
        let exp = exponentToBigDecimal(a0.decimals).div(
          exponentToBigDecimal(a1.decimals),
        );
        a0.basePrice = new BigDecimal(
          BigInt.fromString('5192296858534827628530496329220096'),
        )
          .div(new BigDecimal(dt.value))
          .times(exp);
      }
      a0.oracle = event.params.account.toHexString();
      a0.save();

      PoolTemplate.create(tPool.value);
    }

    // UNI_V3_PATH_ORACLE_ROLE handling.
  } else if (event.params.role.equals(UNI_V3_PATH_ORACLE_ROLE)) {
    let ppo = UniswapPathPriceOracle.bind(event.params.account);

    let tAnatomy = ppo.try_anatomy();
    if (tAnatomy.reverted) {
      log.error('failed get anatomy on address: {}', [
        event.params.account.toHexString(),
      ]);
    } else {
      let asset0 = tAnatomy.value.value0[tAnatomy.value.value0.length - 1];
      let asset1 = tAnatomy.value.value0[0];

      for (let i = 0; i < tAnatomy.value.value1.length; i++) {
        let pOracle = new UniV3PathPriceOracle(
          tAnatomy.value.value1[i].toHexString(),
        );
        pOracle.asset0 = asset0.toHexString();
        pOracle.asset1 = asset1.toHexString();
        pOracle.pathPriceOracle = event.params.account.toHexString();
        pOracle.save();

        PoolTemplate.create(tAnatomy.value.value1[i]);
      }

      let dt = ppo.try_lastAssetPerBaseInUQ(
        tAnatomy.value.value0[tAnatomy.value.value0.length - 1],
      );
      if (!dt.reverted) {
        let a0 = loadOrCreateAsset(asset0);
        let a1 = loadOrCreateAsset(asset1);

        let exp = exponentToBigDecimal(a0.decimals).div(
          exponentToBigDecimal(a1.decimals),
        );
        a0.basePrice = new BigDecimal(
          BigInt.fromString('5192296858534827628530496329220096'),
        )
          .div(new BigDecimal(dt.value))
          .times(exp);
        a0.oracle = event.params.account.toHexString();
        a0.save();
      }
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
