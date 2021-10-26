const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const Mustache = require('mustache')
const config = require('./config.json')

yargs.command('graphgen', 'Generate the subgraph based for the configured feeds.', () => {
  const subgraphTemplatePath = path.join(__dirname, '../subgraph.template.yaml')
  const subraphTemplate = fs.readFileSync(subgraphTemplatePath, 'utf8')

  const subgraphPath = path.join(__dirname, '../subgraph.yaml')
  const subgraph = Mustache.render(subraphTemplate, config)

  fs.writeFileSync(subgraphPath, subgraph, 'utf8')

  const constsTemplatePath = path.join(__dirname, '../consts.template.tsx')
  const constsTemplate = fs.readFileSync(constsTemplatePath, 'utf8')

  const constsPath = path.join(__dirname, '../consts.ts')
  const consts = Mustache.render(constsTemplate, config)

  fs.writeFileSync(constsPath, consts, 'utf8')

  config.pairs.forEach((item) => {
    const chainLinkPath = path.join(__dirname, '../src/mappings/chainlink/aggregators/')
    const templatePath = path.join(chainLinkPath, 'aggregator.template.tsx')
    const template = fs.readFileSync(templatePath, 'utf8')

    const mappingPath = path.join(chainLinkPath, `${item.name}.ts`)
    const mapping = Mustache.render(template, item)

    fs.writeFileSync(mappingPath, mapping, 'utf8')
  })
}).argv
