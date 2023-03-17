import { SetOracleOfCall } from '../../types/PhuturePriceOracle/PhuturePriceOracle';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { loadOrCreateAsset } from '../entities';
import { UniV3PathPriceOracle, UniV3PriceOracle } from '../../types/schema';
import { BASE_ASSETS } from '../../../consts';
import { exponentToBigDecimal } from '../../utils/calc';
import { Pool as PoolTemplate } from '../../types/templates';
import { store } from '@graphprotocol/graph-ts';
import { UniswapPathPriceOracle } from '../../types/PhuturePriceOracle/UniswapPathPriceOracle';
import { UniswapV3PriceOracle } from '../../types/PhuturePriceOracle/UniswapV3PriceOracle';

export function handleSetOracleOf(call: SetOracleOfCall): void {
  let asset = loadOrCreateAsset(call.inputs._asset);
  let oracle = call.inputs._oracle.toHexString();

  // Check if oracle is path price oracle
  let pathContract = UniswapPathPriceOracle.bind(Address.fromString(oracle));
  let anatomy = pathContract.try_anatomy();
  if (!anatomy.reverted) {
    // delete the old oracle for the asset
    if (asset.oracle) {
      store.remove('UniV3PriceOracle', asset.oracle!);
    }

    // handle path
    let asset0 = anatomy.value.value0[anatomy.value.value0.length - 1]; // This should be my asset
    let asset1 = anatomy.value.value0[0]; // This should be the base asset

    for (let i = 0; i < anatomy.value.value1.length; i++) {
      let uniV3Contract = UniswapV3PriceOracle.bind(anatomy.value.value1[i]); // Our deployed uniV3 oracle
      let tPool = uniV3Contract.try_pool(); // This is checking if it is uniV3 or Chainlink
      if (!tPool.reverted) {
        let uniV3Oracle = new UniV3PathPriceOracle(tPool.value.toHexString()); // So we can track this pool and update the assets
        uniV3Oracle.asset0 = asset0.toHexString();
        uniV3Oracle.asset1 = asset1.toHexString();
        uniV3Oracle.pathPriceOracle = oracle; // Price oracle is always the contract, so we can query this to get the price
        uniV3Oracle.save();

        PoolTemplate.create(tPool.value); // We create a new one to track events that are emitted
      }
    }

    let dt = pathContract.try_lastAssetPerBaseInUQ(asset0);
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
      a0.save();
    }

    return;
  }

  let uniV3Contract = UniswapV3PriceOracle.bind(Address.fromString(oracle));
  let tPool = uniV3Contract.try_pool();
  if (tPool.reverted) {
    // It's not uniswap v3 oracle
    return;
  }
  // delete the old oracle for the asset
  if (asset.oracle) {
    store.remove('UniV3PriceOracle', asset.oracle!);
  }

  let uniV3Oracle = new UniV3PriceOracle(tPool.value.toHexString());
  let asset0 = uniV3Contract.asset0();
  let asset1 = uniV3Contract.asset1();
  if (BASE_ASSETS.includes(asset0.toHexString().toLowerCase())) {
    asset0 = uniV3Contract.asset1();
    asset1 = uniV3Contract.asset0(); // stable coin must be always asset1.
  }

  uniV3Oracle.asset0 = asset0.toHexString();
  uniV3Oracle.asset1 = asset1.toHexString();
  uniV3Oracle.priceOracle = oracle;
  uniV3Oracle.save();

  let a0 = loadOrCreateAsset(asset0);
  let a1 = loadOrCreateAsset(asset1);
  let dt = uniV3Contract.try_lastAssetPerBaseInUQ(asset0);
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
  a0.oracle = uniV3Oracle.id;
  a0.save();

  PoolTemplate.create(tPool.value);
}
