import { IndexManaged } from '../../../../helpers';
import { handleIndexCreation } from './baseIndex';
import { ManagedIndexCreated, ManagedIndexFactory } from '../../types/Index/ManagedIndexFactory';
import { loadOrCreateIndexFactory } from "../entities";

export function handleManagedIndexCreated(event: ManagedIndexCreated): void {
  let idxFactory = ManagedIndexFactory.bind(event.address);
  let idxF = loadOrCreateIndexFactory(event.address, IndexManaged, idxFactory.vTokenFactory());

  let index = handleIndexCreation(IndexManaged, event, event.params.index, event.params._assets);
  index.indexFactory = idxF.id;
  index.save();
}
