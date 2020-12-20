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
var visit = require('unist-util-visit')
// var toc = require('remark-toc')
var { toc } = require('../utils/remak')
const { getAllMdPost } = require('../utils/post')
import 'prismjs/themes/prism-tomorrow.css'

function frontmatterAttacher() {
  return function (tree, vfile) {
    visit(tree, 'yaml', (node) => {
      if (node.value) {
        vfile.frontmatter = jsYaml.safeLoad(node.value)
      }
    })
  }
}

function getMarkdown () {
  return new Promise((resolve, reject) => {
    unified()
    .use(parse)
    .use(stringify)
    .use(prism, {})
    .use(html)
    .use(frontmatter, ['yaml', 'toml'])
    .use(frontmatterAttacher)
    .use(toc)
    .process(vfile.readSync(path.resolve(process.cwd(), './posts/读书笔记-你不知道的JavaScript-上篇.md')), function (err, file) {
      resolve(file)
      console.error(report(err || file))
      reject(report(err || file))
    })
  })
}

export default function Example ({ contents = '', toc = '' }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{__html: toc }}></div>
      <div dangerouslySetInnerHTML={{__html: contents}}></div>
    </div>
  )
}

export async function getStaticProps () {
  let result = await getMarkdown()
  let allposts = await getAllMdPost()
  console.log(allposts.map(item => item.prev))
  return {
    props: {
      posts: {},
      contents: result && result.contents,
      toc: result && result.toc
    }
  }
}