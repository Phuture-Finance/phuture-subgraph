import {
  Transfer as TopNMarketCapIndexTransferEvent,
  UpdateAnatomy,
} from "../../types/templates/TopNMarketCapIndex/TopNMarketCapIndex";
import { handleAllIndexesTransfers } from "./transfer";
import { updateAnatomy } from "./updateAnatomy";

export function handleTopNMarketCapIndexTransfer(event: TopNMarketCapIndexTransferEvent): void {
  handleAllIndexesTransfers(event, event.params.from, event.params.to, event.params.value);
}

export function handleUpdateAnatomy(event: UpdateAnatomy): void {
  updateAnatomy(event.address, event.params.assets, event.params.weights);
}
