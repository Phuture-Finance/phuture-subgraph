import { IndexManaged } from '../../../../helpers';
import {
  ManagedIndexCreated,
  ManagedIndexFactory,
} from '../../types/Index/ManagedIndexFactory';
import { loadOrCreateIndexFactory } from '../entities';

import { handleIndexCreation } from './baseIndex';

export function handleManagedIndexCreated(event: ManagedIndexCreated): void {
  let indexFactoryContract = ManagedIndexFactory.bind(event.address);
  let indexFactory = loadOrCreateIndexFactory(
    event.address,
    IndexManaged,
    indexFactoryContract.vTokenFactory(),
  );

  let index = handleIndexCreation(
    IndexManaged,
    event,
    event.params.index,
    event.params._assets,
  );
  index.indexFactory = indexFactory.id;

  index.save();
}
