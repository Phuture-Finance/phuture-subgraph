CONTRACTS_PATH ?= .

.PHONY update-contracts:
update-contracts:
	cp $(CONTRACTS_PATH)/FeePool.sol/FeePool.json subgraphs/abis/Phuture/FeePool.json
	cp $(CONTRACTS_PATH)/IndexRegistry.sol/IndexRegistry.json subgraphs/abis/Phuture/IndexRegistry.json
	cp $(CONTRACTS_PATH)/StaticIndex.sol/StaticIndex.json subgraphs/abis/Phuture/StaticIndex.json
	cp $(CONTRACTS_PATH)/StaticIndexFactory.sol/StaticIndexFactory.json subgraphs/abis/Phuture/StaticIndexFactory.json
	cp $(CONTRACTS_PATH)/TopNMarketCapIndex.sol/TopNMarketCapIndex.json subgraphs/abis/Phuture/TopNMarketCapIndex.json
	cp $(CONTRACTS_PATH)/TopNMarketCapIndexFactory.sol/TopNMarketCapIndexFactory.json subgraphs/abis/Phuture/TopNMarketCapIndexFactory.json
	cp $(CONTRACTS_PATH)/TrackedIndex.sol/TrackedIndex.json subgraphs/abis/Phuture/TrackedIndex.json
	cp $(CONTRACTS_PATH)/TrackedIndexFactory.sol/TrackedIndexFactory.json subgraphs/abis/Phuture/TrackedIndexFactory.json
	cp $(CONTRACTS_PATH)/vToken.sol/vToken.json subgraphs/abis/Phuture/vToken.json
	cp $(CONTRACTS_PATH)/vTokenFactory.sol/vTokenFactory.json subgraphs/abis/Phuture/vTokenFactory.json
	cp $(CONTRACTS_PATH)/Orderer.sol/Orderer.json subgraphs/abis/Phuture/Orderer.json

