const fs = require('fs')
const path = require('path')
const postDirectory = path.resolve(process.cwd(), 'posts')
const vfile = require('to-vfile')
const report = require('vfile-reporter')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const frontmatter = require('remark-frontmatter')
const html = require('remark-html')
const prism = require('remark-prism')
const slug = require('remark-slug')
const { frontmatterAttacher, toc } = require('./remak')
const md5 = require('md5')

async function getMdPost (filename) {
  return new Promise((resolve, reject) => {
    unified()
    .use(parse)
    .use(stringify)
    .use(slug)
    .use(prism, {})
    .use(html)
    .use(frontmatter, ['yaml', 'toml'])
    .use(frontmatterAttacher)
    .use(toc)
    .process(vfile.readSync(path.resolve(postDirectory, `${filename}.md`)), function (err, file) {
      resolve(file)
      console.error(report(err || file))
      reject(report(err || file))
    })
  })
}

async function getAllMdFile () {
  return await fs.readdirSync(postDirectory).filter(name => {
    return /\.md$/.test(path.extname(name))
  }).map(name => path.basename(name, path.extname(name)))
}

async function getAllMdPost () {
  const allMdFile = await getAllMdFile()

  let allPost = []

  for (let name of allMdFile) { 
    const post = await getMdPost(name)
    allPost.push({ ...post, name })
  }

  allPost = allPost.map((item, index, arr) => {
    let prev = arr[index - 1]
    let next = arr[index + 1]
    let post = { ...item, id: md5(item.name) }

    if (prev) {
      post.prev = { name: prev.name, id: md5(prev.name) }
    }

    if (next) {
      post.next = { name: next.name, id: md5(next.name) }
    }

    return post
  })

  return allPost
}

module.exports = {
  getAllMdFile,
  postDirectory,
  getAllMdPost,
  getMdPost
}