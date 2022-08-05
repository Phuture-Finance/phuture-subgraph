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
