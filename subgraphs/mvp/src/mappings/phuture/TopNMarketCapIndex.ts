import { handleAllIndexesTransfers } from "./transfer";
import { Transfer as TopNMarketCapIndexTransferEvent } from "../../types/templates/TopNMarketCapIndex/TopNMarketCapIndex";

export function handleTopNMarketCapIndexTransfer(event: TopNMarketCapIndexTransferEvent): void {
  handleAllIndexesTransfers(event, event.params.from, event.params.to, event.params.value);
}
