import { IndexTracked } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { TrackedIndexCreated } from '../../types/TrackedIndexFactory/TrackedIndexFactory';

export function handleTrackedIndexCreated(event: TrackedIndexCreated): void {
  handleIndexCreation(IndexTracked, event, event.params.index, event.params.assets);
}
