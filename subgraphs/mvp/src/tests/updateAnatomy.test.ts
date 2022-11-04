import { Address } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

import { updateAnatomy } from '../mappings/phuture/updateAnatomy';
import { Index, Asset } from '../types/schema';
//import { logStore } from "matchstick-as/assembly/store";

test('inactive assets logic', () => {
  const indexID = '0xa16081f360e3847006db660bae1c6d1ba1c0ffee';
  const assetID1 = '0xa16081f360e3847006db660bae1c6d1babcbeef1';
  const assetID2 = '0xa16081f360e3847006db660bae1c6d1babcbeef2';
  const assetID3 = '0xa16081f360e3847006db660bae1c6d1babcbeef3';

  const index = new Index(indexID);
  const asset1 = new Asset(assetID1);
  const asset2 = new Asset(assetID2);
  const asset3 = new Asset(assetID3);

  // Store the entities in the store, so that it can be accessed in the handler
  index.save();

  asset1.isWhitelisted = false;
  asset2.isWhitelisted = false;
  asset3.isWhitelisted = false;

  asset1.save();
  asset2.save();
  asset3.save();

  updateAnatomy(
    Address.fromString(indexID),
    Address.fromString(assetID1),
    0,
    BigInt.fromI32(0),
  );
  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1ba1c0ffee',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1]',
  );

  updateAnatomy(
    Address.fromString(indexID),
    Address.fromString(assetID2),
    0,
    BigInt.fromI32(0),
  );

  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1ba1c0ffee',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2]',
  );

  updateAnatomy(
    Address.fromString(indexID),
    Address.fromString(assetID3),
    0,
    BigInt.fromI32(0),
  );

  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1ba1c0ffee',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef2, 0xa16081f360e3847006db660bae1c6d1babcbeef3]',
  );

  // test with a non zero weight
  updateAnatomy(
    Address.fromString(indexID),
    Address.fromString(assetID2),
    1,
    BigInt.fromI32(0),
  );

  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1ba1c0ffee',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1, 0xa16081f360e3847006db660bae1c6d1babcbeef3]',
  );

  clearStore();
});
