import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts/index';
import { newMockEvent } from "matchstick-as/assembly/index"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { handleAllIndexesTransfers } from "../src/mappings/phuture/transfer"
import { logStore } from "matchstick-as/assembly/store";
import { Index, Transaction, UserIndex } from '../src/types/schema';

test("transfer", () => {
  let newEvent = changetype<ethereum.Event>(newMockEvent())

  // This address is the default address for newMockEvent
  let index = new Index("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");

  // Store the index in the store, so that it can be accessed in the handler
  index.save();

  let from = "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
  let to = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"

  let fromUserIndexId = from.concat('-').concat(newEvent.address.toHexString());
  let fromUserIndex = new UserIndex(fromUserIndexId);

  fromUserIndex.index = index.id;
  fromUserIndex.user = from;
  fromUserIndex.balance = BigDecimal.fromString("100000");
  fromUserIndex.save()

  let transaction = new Transaction("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
  transaction.timestamp = BigInt.fromString("1649328805");
  transaction.save();
  handleAllIndexesTransfers(newEvent,Address.fromString(from), Address.fromString(to), BigInt.fromI32(11111))

  // New transaction with the same timestamp
  transaction.timestamp = BigInt.fromString("1649328805");
  transaction.save();
  handleAllIndexesTransfers(newEvent,Address.fromString(from), Address.fromString(to), BigInt.fromI32(77777))

  logStore();

  assert.fieldEquals("UserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0", "balance", "11111");
  assert.fieldEquals("UserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1", "balance", "88888");

  assert.fieldEquals("UserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0", "balance", "88889");
  assert.fieldEquals("UserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1", "balance", "11112");

  assert.fieldEquals("DailyUserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600", "avgBalance", "49999.5");
  assert.fieldEquals("DailyUserIndexHistory", "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600", "avgBalance", "50000.5");

  clearStore()

});

// logStore:
/*
tranfer
--------------------------------------------------
🛠  {
  "Transfer": {
    "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-0": {
      "id": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-0"
      },
      "transaction": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "type": {
        "type": "String",
        "data": "Send"
      },
      "value": {
        "type": "BigInt",
        "data": "77777"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "to": {
        "type": "Bytes",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      },
      "from": {
        "type": "Bytes",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      }
    }
  },
  "UserIndex": {
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a": {
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "88888"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a": {
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "11112"
      }
    }
  },
  "Transaction": {
    "0xa16081f360e3847006db660bae1c6d1b2e17ec2a": {
      "value": {
        "type": "BigInt",
        "data": "0"
      },
      "gasPrice": {
        "type": "BigInt",
        "data": "0"
      },
      "id": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649328805"
      },
      "gasUsed": {
        "type": "BigInt",
        "data": "0"
      },
      "transfers": {
        "type": "List",
        "data": [
          {
            "type": "String",
            "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-0"
          }
        ]
      },
      "blockNumber": {
        "type": "BigInt",
        "data": "0"
      }
    }
  },
  "UserIndexHistory": {
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0": {
      "timestamp": {
        "type": "BigInt",
        "data": "1649328805"
      },
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "11111"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1": {
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "88888"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649328805"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1": {
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "11112"
      },
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649328805"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0": {
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-0"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649328805"
      },
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      },
      "balance": {
        "type": "BigDecimal",
        "data": "88889"
      }
    }
  },
  "User": {
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef": {
      "indexes": {
        "type": "List",
        "data": [
          {
            "type": "String",
            "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
          }
        ]
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee": {
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      },
      "indexes": {
        "type": "List",
        "data": [
          {
            "type": "String",
            "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
          }
        ]
      }
    }
  },
  "DailyUserIndexHistory": {
    "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600": {
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee"
      },
      "number": {
        "type": "BigDecimal",
        "data": "2"
      },
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "avgBalance": {
        "type": "BigDecimal",
        "data": "50000.5"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649289600"
      },
      "total": {
        "type": "BigDecimal",
        "data": "100001"
      }
    },
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600": {
      "id": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600"
      },
      "number": {
        "type": "BigDecimal",
        "data": "2"
      },
      "timestamp": {
        "type": "BigInt",
        "data": "1649289600"
      },
      "index": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "total": {
        "type": "BigDecimal",
        "data": "99999"
      },
      "avgBalance": {
        "type": "BigDecimal",
        "data": "49999.5"
      },
      "user": {
        "type": "String",
        "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef"
      }
    }
  },
  "Index": {
    "0xa16081f360e3847006db660bae1c6d1b2e17ec2a": {
      "created": {
        "type": "BigInt",
        "data": "0"
      },
      "decimals": {
        "type": "BigInt",
        "data": "0"
      },
      "sector": {
        "type": "BigInt",
        "data": "0"
      },
      "totalSupply": {
        "type": "BigInt",
        "data": "0"
      },
      "symbol": {
        "type": "String",
        "data": ""
      },
      "name": {
        "type": "String",
        "data": ""
      },
      "marketCap": {
        "type": "BigDecimal",
        "data": "0"
      },
      "basePrice": {
        "type": "BigDecimal",
        "data": "0"
      },
      "feeMint": {
        "type": "BigInt",
        "data": "0"
      },
      "type": {
        "type": "String",
        "data": ""
      },
      "indexFactory": {
        "type": "String",
        "data": ""
      },
      "transaction": {
        "type": "String",
        "data": ""
      },
      "feeBurn": {
        "type": "BigInt",
        "data": "0"
      },
      "uniqueHolders": {
        "type": "BigInt",
        "data": "1"
      },
      "users": {
        "type": "List",
        "data": [
          {
            "type": "String",
            "data": "0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
          }
        ]
      },
      "_assets": {
        "type": "List",
        "data": []
      },
      "id": {
        "type": "String",
        "data": "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
      },
      "baseVolume": {
        "type": "BigDecimal",
        "data": "0"
      },
      "feeAUMPercent": {
        "type": "BigDecimal",
        "data": "0"
      }
    }
  }
}


All 1 tests passed! 😎
*/
