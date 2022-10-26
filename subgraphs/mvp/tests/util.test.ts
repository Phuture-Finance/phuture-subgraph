import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';
import { updateIndexBasePriceByIndex } from '../src/utils/index';
import { Index, Asset, IndexAsset } from '../src/types/schema';
//import { logStore } from "matchstick-as/assembly/store";

// TODO:
// thread 'main' panicked at '🆘 Key: '0x5f4e…8419latestAnswerlatestAnswer():(int256)' not found in map. Please mock the function before calling it.'

/*
test("update index base price by index", () => {
  let indexID = "0xa16081f360e3847006db660bae1c6d1ba1c0ffee";
  let assetID1 = "0xa16081f360e3847006db660bae1c6d1babcbeef1";
  let assetID2 = "0xa16081f360e3847006db660bae1c6d1babcbeef2";
  let assetID3 = "0xa16081f360e3847006db660bae1c6d1babcbeef3";

  let index = new Index(indexID);
  let asset1 = new Asset(assetID1);
  let asset2 = new Asset(assetID2);
  let asset3 = new Asset(assetID3);

  let indexAssets = index._assets;

  indexAssets.push(assetID1);
  indexAssets.push(assetID2);
  indexAssets.push(assetID3);

  index._assets = indexAssets;
  index.totalSupply = BigInt.fromI64(1234);

  index.save();

  let indexAsset1 = new IndexAsset(index.id.concat('-').concat(asset1.id));
  indexAsset1.shares = BigInt.fromString("1234");
  indexAsset1.save();

  let indexAsset2 = new IndexAsset(index.id.concat('-').concat(asset2.id));
  indexAsset2.shares = BigInt.fromString("2345");
  indexAsset2.save();

  let indexAsset3 = new IndexAsset(index.id.concat('-').concat(asset3.id));
  indexAsset3.shares = BigInt.fromString("3456");
  indexAsset3.save();

  asset1.basePrice = BigDecimal.fromString("9.25712364");
  asset1.decimals = BigInt.fromString("18");
  asset1.save();

  asset2.basePrice = BigDecimal.fromString("41110.62256736");
  asset2.decimals = BigInt.fromString("8");
  asset2.save();

  asset3.basePrice = BigDecimal.fromString("14.1035565");
  asset3.decimals = BigInt.fromString("18");
  asset3.save();

  updateIndexBasePriceByIndex(index, BigInt.fromI64(1652354361))

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "basePrice", "0.0007812350884964766330484892706645057");
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "marketCap", "0.96404409920465216518183576");

  clearStore()
});
*/
