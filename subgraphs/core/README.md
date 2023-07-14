# Core Subgraph

### Set appropriate network:
Set the path inside the [config file](config/config.js) to one of the networks defined inside the [config](config) folder.
```shell
let defaultPath = './mainnet/';
```

### Building the project

```bash
# run pre codegen
npm run precodegen
# run codegen
npm run codegen
# run build
npm run build
```

### Local Deployment
    
```bash
npm run create:local && npm run deploy:local
```

### Deploying to Mainnet Service

```bash
# Authenticate your local machine with the service
graph auth --studio ${AUTH_TOKEN}
# Deploy the subgraph
npm run deploy:mainnet 
npm run deploy:avalanche
```

### Deploying to Hosted Service

```bash
# Authenticate your local machine with the service
graph auth --product ${AUTH_TOKEN}
# Deploy the subgraph
graph deploy --product hosted-service phuture-finance/phuture-v1
graph deploy --product hosted-service phuture-finance/phuture-avax-core
```
