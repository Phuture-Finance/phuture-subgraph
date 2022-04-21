const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const subgraphCfg = require('./config.js');

console.log(subgraphCfg.data);

const subgraphTemplatePath = path.join(__dirname, '../subgraph.template.yaml');
const subgraphTemplate = fs.readFileSync(subgraphTemplatePath, 'utf8');

const subgraphPath = path.join(__dirname, '../subgraph.yaml');
const subgraph = Mustache.render(subgraphTemplate, subgraphCfg.data);

fs.writeFileSync(subgraphPath, subgraph, 'utf8');

const constsTemplatePath = path.join(__dirname, '../consts.template.tsx');
const constsTemplate = fs.readFileSync(constsTemplatePath, 'utf8');

/*
// Code generation section for aggregator for each specific token.
subgraphCfg.pairs.forEach((item) => {
  const chainLinkPath = path.join(__dirname, '../src/mappings/chainlink/aggregators/');
  const templatePath = path.join(chainLinkPath, 'aggregator.template.tsx');
  const template = fs.readFileSync(templatePath, 'utf8');

  const mappingPath = path.join(chainLinkPath, `${item.name}.ts`);
  const mapping = Mustache.render(template, item);

  fs.writeFileSync(mappingPath, mapping, 'utf8');
});
 */

subgraphCfg.data['ChainLinkAssetMap'] = subgraphCfg.pairs;

const constsPath = path.join(__dirname, '../consts.ts');
const consts = Mustache.render(constsTemplate, subgraphCfg.data);

fs.writeFileSync(constsPath, consts, 'utf8');
