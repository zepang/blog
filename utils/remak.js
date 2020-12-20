var util = require('mdast-util-toc')
var defaultHeading = 'toc|table[ -]of[ -]contents?'
var unified = require('unified')
var parse = require('remark-parse')
var stringify = require('remark-stringify')
var toVfile = require('to-vfile')
var html = require('remark-html')
var visit = require('unist-util-visit')
var jsYaml = require('js-yaml')

function toc(options) {
  var settings = options || {}
  var heading = settings.heading || defaultHeading
  var depth = settings.maxDepth || 6
  var tight = settings.tight
  var skip = settings.skip

  return transformer

  function transformer(node, vfile) {
    var result = util(node, {
      heading: heading,
      maxDepth: depth,
      tight: tight,
      skip: skip
    })
    
    if (result.index === null || result.index === -1 || !result.map) {
      return
    }

    node.children = [].concat(
      node.children.slice(0, result.index - 1),
      node.children.slice(result.endIndex)
    )

    let tocVfile = unified().use(parse).use(stringify).use(html).processSync(unified().use(stringify).stringify(result.map))
    
    vfile.toc = tocVfile.contents || ''
  }
}

function frontmatterAttacher() {
  return function (tree, vfile) {
    visit(tree, 'yaml', (node) => {
      if (node.value) {
        vfile.frontmatter = jsYaml.safeLoad(node.value)
      }
    })
  }
}

function rmTocHeadingAttacher () {
  function all(values) {
    var result = []
    var index = -1
  
    while (++index < values.length) {
      result[index] = toString(values[index])
    }
  
    return result.join('')
  }

  function toString(node) {
    return (
      (node &&
        (node.value ||
          node.alt ||
          node.title ||
          ('children' in node && all(node.children)) ||
          ('length' in node && all(node)))) ||
      ''
    )
  }

  return function (tree) {
    visit(tree, 'heading', (node, position) =>{
      const reg = new RegExp('^(' + defaultHeading + ')$', 'i')
      if (reg.test(toString(node))) {
        console.log(toString(node), position)
        tree.children = [].concat(
          tree.children.slice(0, position),
          tree.children.slice(position + 1)
        )
      }
    })
  }
}

module.exports = {
  toc,
  frontmatterAttacher
}