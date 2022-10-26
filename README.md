# Phuture Subgraph

For setting up the local development environment there is a `docker-compose.yml` file in the root directory. Instructions for starting the local development environment are as follows:

#### 1. Stop any running docker containers
```bash
$ docker-compose down -v
```
or
```bash
$ make docker-down
```

#### 2. Start the local graph-node and services which it depends on
```bash
$ docker-compose up -d
```
or
```bash
$ make docker-up
```

#### 3. Run a local blockchain node
There are several options for running a local blockchain node ([ganache](https://trufflesuite.com/ganache/), [hardhat](https://hardhat.org/), [anvil](https://book.getfoundry.sh/anvil/)). 
Preferably, use [anvil](https://book.getfoundry.sh/anvil/) as it is the most lightweight and easy to use. After installation of [forge](https://book.getfoundry.sh/forge/) a local anvil node can be run with the following command:
````bash
$ anvil --fork-url https://eth-mainnet.g.alchemy.com/v2/<alchemy-api-key>--fork-block-number 15818552 --gas-limit 50000000 --host 0.0.0.0 --chain-id 1
````
There are a couple of caveats to watch for when running anvil:
- The `--fork-url` flag must be set to a valid ethereum node. The paid tier of [alchemy](https://www.alchemy.com/) is nedeed for this purpose.
- The `--gas-limit` flag must be set to a value that is greater than the gas limit of the block that is being forked from. This is because the subgraph will not be able to sync if the gas limit is too low. The gas limit of the block that is being forked from can be found on [etherscan](https://etherscan.io/). There is a [bug](https://github.com/bluealloy/revm/issues/135) with anvil requiring the gas limit to be set at 50 million.
- The `--host` flag must be set to 0.0.0.0. This is because the subgraph will not be able to sync if the host is set to localhost since the graph node is running in a docker container.
- The `--chain-id` flag must be set to 1 for forking ethereum mainnet.

#### 4. Deploy you contracts to the local blockchain node
The contracts that are deployed to the local blockchain node are the contracts that the subgraph will be indexing. Make note of the addresses and block numbers of contract deployments.

#### 5. Create the subgraph
Create the subgraph by positioning yourself in the `subgraphs/subgraph_to_create` directory and running the following command:
```bash
$ make create
```

#### 6. Generate entities from the graphql schema
After defining entities in the `subgraphs/subgraph_to_create/schema.graphql` file, generate the entities by running the following command:
```bash
$ npm run codegen
```
Note: Each subgraph folder inside `subgraphs` directory has a config folder where you need to populate addresses and block numbers of [contract deployments](#3-run-a-local-blockchain-node). This info will be used while generating `subgraph.yaml` file from `subgraph.template.yaml` file.

#### 7. Build the subgraph
After defining entities and its corresponding handlers in the `subgraphs/subgraph_to_create/src/mapping.ts` file, build the subgraph by running the following command:
```bash
$ npm run build
```

#### 8. Deploy the subgraph
The final step is deploying the subgraph to the local graph-node. This can be done by running the following command:
```bash
$ make deploy
```

## Subgraph declaration

Each subgraph folder inside `subgraphs` directory must declare a list of  scripts in `package.json`.

```json
{
  "scripts": {
    "precodegen": "rimraf src/types src/mappings/chainlink/aggregators/*.ts && node config/index.js",
    "codegen": "graph codegen --output-dir src/types/",
    "build": "graph build",
    "create:local": "graph create phuture/${name_of_your_subgraph} --node http://0.0.0.0:8020",
    "deploy:local": "graph deploy phuture/${name_of_your_subgraph} --ipfs http://0.0.0.0:5001 --node http://0.0.0.0:8020"
  }
}
```

### Short explanation of the specified list of scripts:

- `precodegen` drops the caches of previously generated entities, `node config/index.js` execute templating for this files like: `{subgraph}/subgraph.yaml`, `{subgraph}/consts.ts`, etc.
- `codegen` executes code-generation process, simply saying everything what is defined int the `{subgraph}/schema.graphql`.
- `build` executes typescript compilation to wasm bytecode which going to be running on the graph hosted server.
- `create:local` create subgraph entity in the self-hosted node, `${name_of_your_subgraph}` must be uniq name of your subgraph.
- `deploy:local` executes compilation of typescripts and deploying the metadata information to local ipfs node, and deploying wasm binaries to the local graph node.


### Overview of the services relation

![alt text](docs/images/services.png 'Services overview')

### Subgraph overview

![alt text](docs/images/subgraph.png 'Subgraph overview')

## Example with processing `vToken` events

### Definition of storable entities

If you want to store aggregated data in database to be able to query them by graphql after, we need to define entities in `schema.graphql` file:

```graphql
type vToken @entity {
  "Address (hash)"
  id: ID!
  asset: Asset!
  tokenType: String!
  deposited: BigInt
}
```

When new entities are ready you need to generate typescript data structures for them, by running `npm run codegen` in the subgraph folder. All code-generated entities are stored in `{subgraph}/types/schema.ts` file, for this specific Entity, data might be following:

```typescript
export class vToken extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));

    this.set('asset', Value.fromString(''));
    this.set('tokenType', Value.fromString(''));
  }

  save(): void {
    let id = this.get('id');
    assert(id != null, 'Cannot save vToken entity without an ID');
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        'Cannot save vToken entity with non-string ID. ' +
          'Considering using .toHex() to convert the "id" to a string.',
      );
      store.set('vToken', id.toString(), this);
    }
  }

  static load(id: string): vToken | null {
    return changetype<vToken | null>(store.get('vToken', id));
  }

  get id(): string {
    let value = this.get('id');
    return value!.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get asset(): string {
    let value = this.get('asset');
    return value!.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get tokenType(): string {
    let value = this.get('tokenType');
    return value!.toString();
  }

  set tokenType(value: string) {
    this.set('tokenType', Value.fromString(value));
  }

  get deposited(): BigInt | null {
    let value = this.get('deposited');
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set deposited(value: BigInt | null) {
    if (!value) {
      this.unset('deposited');
    } else {
      this.set('deposited', Value.fromBigInt(<BigInt>value));
    }
  }
}
```

In such typescript definition `id` field is the primary key used for loading/saving. All entities are stored in postgres db, so when we define a new entity with this fields set, there is a table created in postgres with similar structure.

#### Here is example of table structure created in postgres for the `vToken` entity:

```postgresql
create table sgd3.v_token
(
    id text not null,
    asset text not null,
    token_type bytea not null,
    vid bigserial
    constraint v_token_pkey
    primary key,
    block_range int4range not null,
    constraint v_token_id_block_range_excl
    exclude using gist (id with =, block_range with &&)
);
```

### Events processing

To track events from the blockchain you should define these events in the subgraph configuration file, where you specify abi files and events structure, also you need to set the address of smart-contract and the block start number to start scanning the blockchain.

Example of `subgraph.template.yaml`:

```yaml
- kind: ethereum/contract
  name: vTokenFactory
  network: { { network } }
  source:
    abi: vTokenFactory
    address: '{{VTokenFactory}}'
    startBlock: { { VTokenFactoryBlockNumber } }
  mapping:
    kind: ethereum/events
    apiVersion: 0.0.5
    language: wasm/assemblyscript
    entities:
      - vToken
    abis:
      - name: vTokenFactory
        file: ../abis/Phuture/vTokenFactory.json
      - name: ERC20
        file: ../abis/ERC20/ERC20.json
      - name: ERC20SymbolBytes
        file: ../abis/ERC20/ERC20SymbolBytes.json
      - name: ERC20NameBytes
        file: ../abis/ERC20/ERC20NameBytes.json
    eventHandlers:
      - event: VTokenCreated(address,address,bytes32)
        handler: handleVTokenCreated
    file: ./src/mappings/phuture/vTokenFactory.ts
```

Here you define all the smart contracts which we are listening, and the mapping between event and event handler, in such case subgraph node would be listening `VTokenCreated` events, and executing `handleVTokenCreated` handler function with the event data. To show how application stores this entity lets have an example of the code of this handler:

```typescript
export function loadOrCreateVToken(address: Address): vToken {
  let id = address.toHexString();
  let vt = vToken.load(id);
  if (!vt) {
    vt = new vToken(id);
    vt.deposited = BigInt.zero();
  }

  return vt as vToken;
}

export function handleVTokenCreated(event: VTokenCreated): void {
  if (event.params.vToken.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.params.vToken);
  vt.asset = event.params.asset.toHexString();

  if (event.params.vTokenType == STATIC_TYPE_HASH) {
    vt.tokenType = STATIC_TYPE;
  } else if (event.params.vTokenType == DYNAMIC_TYPE_HASH) {
    vt.tokenType = DYNAMIC_TYPE;
  }

  vt.save();
}
```

##### In this example a node receives the data from event, does some business logic relevant to this entity and makes a save request to the database. Making it available for clinets to query this data.
