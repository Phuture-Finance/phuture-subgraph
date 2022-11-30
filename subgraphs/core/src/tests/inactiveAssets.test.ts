import { Address } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

import { handleAssetRemoved } from '../mappings/phuture/baseIndex';
import { Index, Asset } from '../types/schema';
//import { logStore } from "matchstick-as/assembly/store";

test('remove asset', () => {
  const indexID1 = '0xa16081f360e3847006db660bae1c6d1bac0ffee1';
  const indexID2 = '0xa16081f360e3847006db660bae1c6d1bac0ffee2';
  const indexID3 = '0xa16081f360e3847006db660bae1c6d1bac0ffee3';
  const indexID4 = '0xa16081f360e3847006db660bae1c6d1bac0ffee4';

  const assetID1 = '0xa16081f360e3847006db660bae1c6d1babcbeef1';

  const index1 = new Index(indexID1);
  const index2 = new Index(indexID2);
  const index3 = new Index(indexID3);
  const index4 = new Index(indexID4);
  const asset1 = new Asset(assetID1);

  const indexes = asset1._indexes;

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

  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1bac0ffee1',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1]',
  );
  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1bac0ffee2',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1]',
  );
  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1bac0ffee3',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1]',
  );
  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1bac0ffee4',
    '_inactiveAssets',
    '[0xa16081f360e3847006db660bae1c6d1babcbeef1]',
  );

  clearStore();
});
