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

subgraphCfg.data['ChainLinkAssetMap'] = subgraphCfg.pairs;

const constsPath = path.join(__dirname, '../consts.ts');
const consts = Mustache.render(constsTemplate, subgraphCfg.data);

fs.writeFileSync(constsPath, consts, 'utf8');
