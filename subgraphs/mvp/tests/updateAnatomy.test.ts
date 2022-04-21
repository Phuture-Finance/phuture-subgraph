import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { BigInt } from '@graphprotocol/graph-ts/index';
import { Address } from "@graphprotocol/graph-ts"
import { updateAnatomy } from "../src/mappings/phuture/updateAnatomy"
import { logStore } from "matchstick-as/assembly/store";
import { Index, Asset } from '../src/types/schema';

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
  asset1.save();
  asset2.save();
  asset3.save();

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID1), 0, BigInt.fromI32(0));
  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1]");

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID2), 0, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2]");

  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID3), 0, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2, 0xa16081f360e3847006db660bae1c6d1babcbeef3]");

  // test with a non zero weight
  updateAnatomy(Address.fromString(indexID), Address.fromString(assetID2), 1, BigInt.fromI32(0));

  assert.fieldEquals("Index", "0xa16081f360e3847006db660bae1c6d1ba1c0ffee", "inactiveAssets", "[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef3]");

  logStore();

  clearStore()

});

