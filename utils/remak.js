const util = require('mdast-util-toc')
const defaultHeading = 'toc|table[ -]of[ -]contents?'
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const html = require('remark-html')
const visit = require('unist-util-visit')
const jsYaml = require('js-yaml')

function toc(options) {
  const settings = options || {}
  const heading = settings.heading || defaultHeading
  const depth = settings.maxDepth || 6
  const tight = settings.tight
  const skip = settings.skip

  return transformer

  function transformer(node, vfile) {
    const result = util(node, {
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
    const result = []
    const index = -1
  
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