# Phuture Subgraph

```bash
# copy env and adjust its content
cp .env.example .env
# fetch current contracts as submodule
npm run prepare:env:dev && npm run prepare:env:dev
# run codegen
npm run codegen
# now you're able to deploy to thegraph via
npm run deploy:hosted:mainnet
```
