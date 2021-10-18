// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AccessControllerSet extends ethereum.Event {
  get params(): AccessControllerSet__Params {
    return new AccessControllerSet__Params(this);
  }
}

export class AccessControllerSet__Params {
  _event: AccessControllerSet;

  constructor(event: AccessControllerSet) {
    this._event = event;
  }

  get accessController(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class FeedConfirmed extends ethereum.Event {
  get params(): FeedConfirmed__Params {
    return new FeedConfirmed__Params(this);
  }
}

export class FeedConfirmed__Params {
  _event: FeedConfirmed;

  constructor(event: FeedConfirmed) {
    this._event = event;
  }

  get asset(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get denomination(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get latestAggregator(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get previousAggregator(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get nextPhaseId(): i32 {
    return this._event.parameters[4].value.toI32();
  }

  get sender(): Address {
    return this._event.parameters[5].value.toAddress();
  }
}

export class FeedProposed extends ethereum.Event {
  get params(): FeedProposed__Params {
    return new FeedProposed__Params(this);
  }
}

export class FeedProposed__Params {
  _event: FeedProposed;

  constructor(event: FeedProposed) {
    this._event = event;
  }

  get asset(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get denomination(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get proposedAggregator(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get currentAggregator(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[4].value.toAddress();
  }
}

export class OwnershipTransferRequested extends ethereum.Event {
  get params(): OwnershipTransferRequested__Params {
    return new OwnershipTransferRequested__Params(this);
  }
}

export class OwnershipTransferRequested__Params {
  _event: OwnershipTransferRequested;

  constructor(event: OwnershipTransferRequested) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class ChainLink__getPhaseResultPhaseStruct extends ethereum.Tuple {
  get phaseId(): i32 {
    return this[0].toI32();
  }

  get startingAggregatorRoundId(): BigInt {
    return this[1].toBigInt();
  }

  get endingAggregatorRoundId(): BigInt {
    return this[2].toBigInt();
  }
}

export class ChainLink__getPhaseRangeResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class ChainLink__getRoundDataResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromSignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class ChainLink__latestRoundDataResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromSignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class ChainLink__proposedGetRoundDataResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromSignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class ChainLink__proposedLatestRoundDataResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromSignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class ChainLink extends ethereum.SmartContract {
  static bind(address: Address): ChainLink {
    return new ChainLink("ChainLink", address);
  }

  decimals(base: Address, quote: Address): i32 {
    let result = super.call("decimals", "decimals(address,address):(uint8)", [
      ethereum.Value.fromAddress(base),
      ethereum.Value.fromAddress(quote)
    ]);

    return result[0].toI32();
  }

  try_decimals(base: Address, quote: Address): ethereum.CallResult<i32> {
    let result = super.tryCall(
      "decimals",
      "decimals(address,address):(uint8)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  description(base: Address, quote: Address): string {
    let result = super.call(
      "description",
      "description(address,address):(string)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toString();
  }

  try_description(base: Address, quote: Address): ethereum.CallResult<string> {
    let result = super.tryCall(
      "description",
      "description(address,address):(string)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  getAccessController(): Address {
    let result = super.call(
      "getAccessController",
      "getAccessController():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_getAccessController(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getAccessController",
      "getAccessController():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getAnswer(base: Address, quote: Address, roundId: BigInt): BigInt {
    let result = super.call(
      "getAnswer",
      "getAnswer(address,address,uint256):(int256)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return result[0].toBigInt();
  }

  try_getAnswer(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getAnswer",
      "getAnswer(address,address,uint256):(int256)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getCurrentPhaseId(base: Address, quote: Address): i32 {
    let result = super.call(
      "getCurrentPhaseId",
      "getCurrentPhaseId(address,address):(uint16)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toI32();
  }

  try_getCurrentPhaseId(
    base: Address,
    quote: Address
  ): ethereum.CallResult<i32> {
    let result = super.tryCall(
      "getCurrentPhaseId",
      "getCurrentPhaseId(address,address):(uint16)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  getFeed(base: Address, quote: Address): Address {
    let result = super.call("getFeed", "getFeed(address,address):(address)", [
      ethereum.Value.fromAddress(base),
      ethereum.Value.fromAddress(quote)
    ]);

    return result[0].toAddress();
  }

  try_getFeed(base: Address, quote: Address): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getFeed",
      "getFeed(address,address):(address)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getNextRoundId(base: Address, quote: Address, roundId: BigInt): BigInt {
    let result = super.call(
      "getNextRoundId",
      "getNextRoundId(address,address,uint80):(uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return result[0].toBigInt();
  }

  try_getNextRoundId(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getNextRoundId",
      "getNextRoundId(address,address,uint80):(uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getPhase(
    base: Address,
    quote: Address,
    phaseId: i32
  ): ChainLink__getPhaseResultPhaseStruct {
    let result = super.call(
      "getPhase",
      "getPhase(address,address,uint16):((uint16,uint80,uint80))",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );

    return result[0].toTuple() as ChainLink__getPhaseResultPhaseStruct;
  }

  try_getPhase(
    base: Address,
    quote: Address,
    phaseId: i32
  ): ethereum.CallResult<ChainLink__getPhaseResultPhaseStruct> {
    let result = super.tryCall(
      "getPhase",
      "getPhase(address,address,uint16):((uint16,uint80,uint80))",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTuple() as ChainLink__getPhaseResultPhaseStruct
    );
  }

  getPhaseFeed(base: Address, quote: Address, phaseId: i32): Address {
    let result = super.call(
      "getPhaseFeed",
      "getPhaseFeed(address,address,uint16):(address)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );

    return result[0].toAddress();
  }

  try_getPhaseFeed(
    base: Address,
    quote: Address,
    phaseId: i32
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getPhaseFeed",
      "getPhaseFeed(address,address,uint16):(address)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getPhaseRange(
    base: Address,
    quote: Address,
    phaseId: i32
  ): ChainLink__getPhaseRangeResult {
    let result = super.call(
      "getPhaseRange",
      "getPhaseRange(address,address,uint16):(uint80,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );

    return new ChainLink__getPhaseRangeResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_getPhaseRange(
    base: Address,
    quote: Address,
    phaseId: i32
  ): ethereum.CallResult<ChainLink__getPhaseRangeResult> {
    let result = super.tryCall(
      "getPhaseRange",
      "getPhaseRange(address,address,uint16):(uint80,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(phaseId))
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ChainLink__getPhaseRangeResult(
        value[0].toBigInt(),
        value[1].toBigInt()
      )
    );
  }

  getPreviousRoundId(base: Address, quote: Address, roundId: BigInt): BigInt {
    let result = super.call(
      "getPreviousRoundId",
      "getPreviousRoundId(address,address,uint80):(uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return result[0].toBigInt();
  }

  try_getPreviousRoundId(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getPreviousRoundId",
      "getPreviousRoundId(address,address,uint80):(uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getProposedFeed(base: Address, quote: Address): Address {
    let result = super.call(
      "getProposedFeed",
      "getProposedFeed(address,address):(address)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toAddress();
  }

  try_getProposedFeed(
    base: Address,
    quote: Address
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getProposedFeed",
      "getProposedFeed(address,address):(address)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getRoundData(
    base: Address,
    quote: Address,
    _roundId: BigInt
  ): ChainLink__getRoundDataResult {
    let result = super.call(
      "getRoundData",
      "getRoundData(address,address,uint80):(uint80,int256,uint256,uint256,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(_roundId)
      ]
    );

    return new ChainLink__getRoundDataResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_getRoundData(
    base: Address,
    quote: Address,
    _roundId: BigInt
  ): ethereum.CallResult<ChainLink__getRoundDataResult> {
    let result = super.tryCall(
      "getRoundData",
      "getRoundData(address,address,uint80):(uint80,int256,uint256,uint256,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(_roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ChainLink__getRoundDataResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  getRoundFeed(base: Address, quote: Address, roundId: BigInt): Address {
    let result = super.call(
      "getRoundFeed",
      "getRoundFeed(address,address,uint80):(address)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return result[0].toAddress();
  }

  try_getRoundFeed(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getRoundFeed",
      "getRoundFeed(address,address,uint80):(address)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getTimestamp(base: Address, quote: Address, roundId: BigInt): BigInt {
    let result = super.call(
      "getTimestamp",
      "getTimestamp(address,address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return result[0].toBigInt();
  }

  try_getTimestamp(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getTimestamp",
      "getTimestamp(address,address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isFeedEnabled(aggregator: Address): boolean {
    let result = super.call("isFeedEnabled", "isFeedEnabled(address):(bool)", [
      ethereum.Value.fromAddress(aggregator)
    ]);

    return result[0].toBoolean();
  }

  try_isFeedEnabled(aggregator: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isFeedEnabled",
      "isFeedEnabled(address):(bool)",
      [ethereum.Value.fromAddress(aggregator)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  latestAnswer(base: Address, quote: Address): BigInt {
    let result = super.call(
      "latestAnswer",
      "latestAnswer(address,address):(int256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toBigInt();
  }

  try_latestAnswer(base: Address, quote: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "latestAnswer",
      "latestAnswer(address,address):(int256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  latestRound(base: Address, quote: Address): BigInt {
    let result = super.call(
      "latestRound",
      "latestRound(address,address):(uint256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toBigInt();
  }

  try_latestRound(base: Address, quote: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "latestRound",
      "latestRound(address,address):(uint256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  latestRoundData(
    base: Address,
    quote: Address
  ): ChainLink__latestRoundDataResult {
    let result = super.call(
      "latestRoundData",
      "latestRoundData(address,address):(uint80,int256,uint256,uint256,uint80)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return new ChainLink__latestRoundDataResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_latestRoundData(
    base: Address,
    quote: Address
  ): ethereum.CallResult<ChainLink__latestRoundDataResult> {
    let result = super.tryCall(
      "latestRoundData",
      "latestRoundData(address,address):(uint80,int256,uint256,uint256,uint80)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ChainLink__latestRoundDataResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  latestTimestamp(base: Address, quote: Address): BigInt {
    let result = super.call(
      "latestTimestamp",
      "latestTimestamp(address,address):(uint256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return result[0].toBigInt();
  }

  try_latestTimestamp(
    base: Address,
    quote: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "latestTimestamp",
      "latestTimestamp(address,address):(uint256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  proposedGetRoundData(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ChainLink__proposedGetRoundDataResult {
    let result = super.call(
      "proposedGetRoundData",
      "proposedGetRoundData(address,address,uint80):(uint80,int256,uint256,uint256,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );

    return new ChainLink__proposedGetRoundDataResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_proposedGetRoundData(
    base: Address,
    quote: Address,
    roundId: BigInt
  ): ethereum.CallResult<ChainLink__proposedGetRoundDataResult> {
    let result = super.tryCall(
      "proposedGetRoundData",
      "proposedGetRoundData(address,address,uint80):(uint80,int256,uint256,uint256,uint80)",
      [
        ethereum.Value.fromAddress(base),
        ethereum.Value.fromAddress(quote),
        ethereum.Value.fromUnsignedBigInt(roundId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ChainLink__proposedGetRoundDataResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  proposedLatestRoundData(
    base: Address,
    quote: Address
  ): ChainLink__proposedLatestRoundDataResult {
    let result = super.call(
      "proposedLatestRoundData",
      "proposedLatestRoundData(address,address):(uint80,int256,uint256,uint256,uint80)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );

    return new ChainLink__proposedLatestRoundDataResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_proposedLatestRoundData(
    base: Address,
    quote: Address
  ): ethereum.CallResult<ChainLink__proposedLatestRoundDataResult> {
    let result = super.tryCall(
      "proposedLatestRoundData",
      "proposedLatestRoundData(address,address):(uint80,int256,uint256,uint256,uint80)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ChainLink__proposedLatestRoundDataResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  typeAndVersion(): string {
    let result = super.call("typeAndVersion", "typeAndVersion():(string)", []);

    return result[0].toString();
  }

  try_typeAndVersion(): ethereum.CallResult<string> {
    let result = super.tryCall(
      "typeAndVersion",
      "typeAndVersion():(string)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  version(base: Address, quote: Address): BigInt {
    let result = super.call("version", "version(address,address):(uint256)", [
      ethereum.Value.fromAddress(base),
      ethereum.Value.fromAddress(quote)
    ]);

    return result[0].toBigInt();
  }

  try_version(base: Address, quote: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "version",
      "version(address,address):(uint256)",
      [ethereum.Value.fromAddress(base), ethereum.Value.fromAddress(quote)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class AcceptOwnershipCall extends ethereum.Call {
  get inputs(): AcceptOwnershipCall__Inputs {
    return new AcceptOwnershipCall__Inputs(this);
  }

  get outputs(): AcceptOwnershipCall__Outputs {
    return new AcceptOwnershipCall__Outputs(this);
  }
}

export class AcceptOwnershipCall__Inputs {
  _call: AcceptOwnershipCall;

  constructor(call: AcceptOwnershipCall) {
    this._call = call;
  }
}

export class AcceptOwnershipCall__Outputs {
  _call: AcceptOwnershipCall;

  constructor(call: AcceptOwnershipCall) {
    this._call = call;
  }
}

export class ConfirmFeedCall extends ethereum.Call {
  get inputs(): ConfirmFeedCall__Inputs {
    return new ConfirmFeedCall__Inputs(this);
  }

  get outputs(): ConfirmFeedCall__Outputs {
    return new ConfirmFeedCall__Outputs(this);
  }
}

export class ConfirmFeedCall__Inputs {
  _call: ConfirmFeedCall;

  constructor(call: ConfirmFeedCall) {
    this._call = call;
  }

  get base(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get quote(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get aggregator(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class ConfirmFeedCall__Outputs {
  _call: ConfirmFeedCall;

  constructor(call: ConfirmFeedCall) {
    this._call = call;
  }
}

export class ProposeFeedCall extends ethereum.Call {
  get inputs(): ProposeFeedCall__Inputs {
    return new ProposeFeedCall__Inputs(this);
  }

  get outputs(): ProposeFeedCall__Outputs {
    return new ProposeFeedCall__Outputs(this);
  }
}

export class ProposeFeedCall__Inputs {
  _call: ProposeFeedCall;

  constructor(call: ProposeFeedCall) {
    this._call = call;
  }

  get base(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get quote(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get aggregator(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class ProposeFeedCall__Outputs {
  _call: ProposeFeedCall;

  constructor(call: ProposeFeedCall) {
    this._call = call;
  }
}

export class SetAccessControllerCall extends ethereum.Call {
  get inputs(): SetAccessControllerCall__Inputs {
    return new SetAccessControllerCall__Inputs(this);
  }

  get outputs(): SetAccessControllerCall__Outputs {
    return new SetAccessControllerCall__Outputs(this);
  }
}

export class SetAccessControllerCall__Inputs {
  _call: SetAccessControllerCall;

  constructor(call: SetAccessControllerCall) {
    this._call = call;
  }

  get _accessController(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetAccessControllerCall__Outputs {
  _call: SetAccessControllerCall;

  constructor(call: SetAccessControllerCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}
