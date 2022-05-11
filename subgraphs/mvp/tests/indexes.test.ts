import {assert, clearStore, newMockEvent, createMockedFunction, test} from 'matchstick-as/assembly/index'
import {Address, BigInt, ethereum} from "@graphprotocol/graph-ts/index";
import { Index } from "../src/types/schema";
import { UpdateAsset } from '../src/types/IndexRegistry/IndexRegistry';
import { handleAllIndexesTransfers } from "../src/mappings/phuture/transfer";
import { logStore } from "matchstick-as/assembly/store";
import { handleUpdateAsset } from "../src/mappings/phuture/indexRegistry";
import { BASE_ASSETS, ChainLinkAssetMap, SUSHI_FACTORY_ADDRESS, UNI_FACTORY_ADDRESS } from "../consts";

class AssetData {
    address: Address
    symbol: string
    name: string
    decimals: i32
}

let assets : AssetData[] = [
    {
        address: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
        symbol: 'USDC',
        name: 'USDC',
        decimals: 6
    },
    {
        address: Address.fromString("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"),
        symbol: 'WBTC',
        name: 'WBTC',
        decimals: 8
    },
    {
        address: Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
        symbol: 'WETH',
        name: 'WETH',
        decimals: 8
    },
];

test("Register base assets participated in indexes", () => {
    assets.forEach((asset: AssetData) => {
        // ChainLink aggregator address.
        let chAggAddr = Address.fromString(ChainLinkAssetMap.mustGet(asset.address.toHexString()));

        let updateAssetEvent = changetype<UpdateAsset>(newMockEvent());
        updateAssetEvent.parameters.push(
            new ethereum.EventParam("asset", ethereum.Value.fromAddress(asset.address))
        );
        updateAssetEvent.parameters.push(
            new ethereum.EventParam("marketCap", ethereum.Value.fromSignedBigInt(BigInt.fromI32(100000000)))
        );

        // ChainLink Aggregator contract calls.
        createMockedFunction(chAggAddr, 'latestAnswer', 'latestAnswer():(int256)')
            // .withArgs([
            //     ethereum.Value.fromUnsignedBigInt(BigInt.fromString('5000'))
            // ])
            .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(500000000))]);
        createMockedFunction(chAggAddr, 'decimals', 'decimals():(uint8)')
            .returns([ethereum.Value.fromI32(8)]);
        createMockedFunction(chAggAddr, 'description', 'description():(string)')
            .returns([ethereum.Value.fromString(asset.symbol.concat(' / USD'))]);

        // Asset contract calls.
        createMockedFunction(asset.address, 'symbol', 'symbol():(string)')
            .returns([ethereum.Value.fromString(asset.symbol)]);
        createMockedFunction(asset.address, 'name', 'name():(string)')
            .returns([ethereum.Value.fromString(asset.name)]);
        createMockedFunction(asset.address, 'totalSupply', 'totalSupply():(uint256)')
            .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('100000000000'))]);
        createMockedFunction(asset.address, 'decimals', 'decimals():(uint8)')
            .returns([ethereum.Value.fromI32(asset.decimals)]);

        // UniSwap/SushiSwap Aggregator contract calls, set zero address to ignore their calculations.
        for (let i = 0; i < BASE_ASSETS.length; i++) {
            createMockedFunction(Address.fromString(UNI_FACTORY_ADDRESS), 'getPair', 'getPair(address,address):(address)')
                .withArgs([
                    ethereum.Value.fromAddress(Address.fromString(BASE_ASSETS[i])),
                    ethereum.Value.fromAddress(asset.address)
                ])
                .returns([ethereum.Value.fromAddress(Address.zero())]);
            createMockedFunction(Address.fromString(SUSHI_FACTORY_ADDRESS), 'getPair', 'getPair(address,address):(address)')
                .withArgs([
                    ethereum.Value.fromAddress(Address.fromString(BASE_ASSETS[i])),
                    ethereum.Value.fromAddress(asset.address)
                ])
                .returns([ethereum.Value.fromAddress(Address.zero())]);
        }

        handleUpdateAsset(updateAssetEvent);
        logStore();

        assert.fieldEquals(
            "Asset",
            asset.address.toHexString(),
            "basePrice", "5");
    });
});

test("Index balance transfer", () => {
    let newEvent = changetype<ethereum.Event>(newMockEvent());
    newEvent.address = Address.fromString('0x111100000000000000000000000000000000aaaa');
    newEvent.block.timestamp = BigInt.fromI32(1651248027);

    // This address is the default address for newMockEvent
    let index = new Index(newEvent.address.toHexString());
    index.save();

    handleAllIndexesTransfers(
        newEvent,
        Address.fromString('0x0000000000000000000000000000000000000000'),
        Address.fromString('0xF1d4Cc1BcbD0E1E1f7376BB4E6407e70318982d8'),
        BigInt.fromI32(1000),
    );
    logStore();

    handleAllIndexesTransfers(
        newEvent,
        Address.fromString('0xF1d4Cc1BcbD0E1E1f7376BB4E6407e70318982d8'),
        Address.fromString('0x6068Eca296D8E69790434283fA7Be1AbB482cfb4'),
        BigInt.fromI32(1000),
    );
    logStore();

    assert.fieldEquals(
        "UserIndexHistory",
        "0x6068eca296d8e69790434283fa7be1abb482cfb4-0x111100000000000000000000000000000000aaaa-1651248027-1",
        "balance", "1000");

    clearStore();
});
