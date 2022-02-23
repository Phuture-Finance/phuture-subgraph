import { IndexTracked } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { TrackedIndexCreated, TrackedIndexFactory } from '../../types/TrackedIndexFactory/TrackedIndexFactory';
import { loadOrCreateIndexFactory } from "../entities";

export function handleTrackedIndexCreated(event: TrackedIndexCreated): void {
  let idxFactory = TrackedIndexFactory.bind(event.address);
  let idxF = loadOrCreateIndexFactory(event.address, IndexTracked, idxFactory.vTokenFactory());

  let index = handleIndexCreation(IndexTracked, event, event.params.index, event.params.assets);
  index.indexFactory = idxF.id;
  index.save();
}
