import { IndexManaged } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { ManagedIndexCreated } from '../../types/Index/ManagedIndexFactory';
import { loadOrCreateIndexFactory } from "../entities";

export function handleManagedIndexCreated(event: ManagedIndexCreated): void {
  // let idxFactory = ManagedIndexFactory.bind(event.address);

  let idxF = loadOrCreateIndexFactory(event.address, IndexManaged);
  idxF.save();

  let index = handleIndexCreation(IndexManaged, event, event.params.index, event.params._assets);
  index.indexFactory = idxF.id;
  index.save();
}
