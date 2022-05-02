import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { BigInt } from '@graphprotocol/graph-ts/index';
import { Address } from "@graphprotocol/graph-ts"
import { updateAnatomy } from "../src/mappings/phuture/updateAnatomy"
import { handleAssetRemoved } from "../src/mappings/phuture/baseIndex"
import { Index, Asset } from '../src/types/schema';
//import { logStore } from "matchstick-as/assembly/store";

test("inactive assets logic", () => {
  let indexID = "0xa16081f360e3847006db660bae1c6d1ba1c0ffee";
  let assetID1 = "0xa16081f360e3847006db660bae1c6d1babcbeef1";
  let assetID2 = "0xa16081f360e3847006db660bae1c6d1babcbeef2";
  let assetID3 = "0xa16081f360e3847006db660bae1c6d1babcbeef3";

  let index = new Index(indexID);
  let asset1 = new Asset(assetID1);
  let asset2 = new Asset(assetID2);
  let asset3 = new Asset(assetID3);

  // Store the entities in the store, so that it can be accessed in the handler
  index.save();

  asset1.isWhitelisted = false;
  asset2.isWhitelisted = false;
  asset3.isWhitelisted = false;

  asset1.save();
  asset2.save();
  asset3.save();

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID1), 0, BigInt.fromI32(0));
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID2), 0, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2]");

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID3), 0, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2, 0xa16081f360e3847006db660bae1c6d1babcbeef3]");

  // test with a non zero weight
  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID2), 1, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef3]");

  clearStore()

});

test("remove asset", () => {
  let indexID1 = "0xa16081f360e3847006db660bae1c6d1bac0ffee1";
  let indexID2 = "0xa16081f360e3847006db660bae1c6d1bac0ffee2";
  let indexID3 = "0xa16081f360e3847006db660bae1c6d1bac0ffee3";
  let indexID4 = "0xa16081f360e3847006db660bae1c6d1bac0ffee4";

  let assetID1 = "0xa16081f360e3847006db660bae1c6d1babcbeef1";

  let index1 = new Index(indexID1);
  let index2 = new Index(indexID2);
  let index3 = new Index(indexID3);
  let index4 = new Index(indexID4);
  let asset1 = new Asset(assetID1);

  let indexes = asset1._indexes;

  indexes.push(indexID1);
  indexes.push(indexID2);
  indexes.push(indexID3);
  indexes.push(indexID4);

  asset1.isWhitelisted = false;
  asset1._indexes = indexes;

  // Store the entities in the store, so that it can be accessed in the handler
  index1.save();
  index2.save();
  index3.save();
  index4.save();
  asset1.save();

  handleAssetRemoved(Address.fromString(asset1.id));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1bac0ffee1", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1bac0ffee2", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1bac0ffee3", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1bac0ffee4", "_inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");

  //logStore();
  clearStore()

});

