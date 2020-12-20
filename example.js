var vfile = require('to-vfile')
var report = require('vfile-reporter')
var unified = require('unified')
var parse = require('remark-parse')
var stringify = require('remark-stringify')
var frontmatter = require('remark-frontmatter')
var path = require('path')
var jsYaml = require('js-yaml')
var html = require('remark-html')
var prism = require('remark-prism')

unified()
  .use(parse)
  .use(stringify)
  .use(prism, {})
  .use(html)
  .use(frontmatter, ['yaml', 'toml'])
  .use(logger)
  .process(vfile.readSync(path.resolve(process.cwd(), './posts/Vue3x组件渲染.md')), function (err, file) {
    console.log(String(file))
    console.error(report(err || file))
  })

function logger() {

  return function aaa (tree, vfile) {
    var yamlNode = tree.children.find(node => node.type === 'yaml')
    console.log(jsYaml.safeLoad(yamlNode.value))
  }
}