const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs-extra')
const { getAllMdPost, getMdPost } = require('./utils/post')
const debounce = require('debounce')
const summaryFile = path.resolve(__dirname, 'summary.json')

const updateSummary = debounce(async () => {
  await fs.ensureFile(summaryFile)
  let posts = await getAllMdPost()
  let jsonStr = JSON.stringify(posts, null, 2)
  fs.writeFileSync(summaryFile, jsonStr)
}, 200)


const handleFileChange = debounce(async (name) => {
  await fs.ensureFile(summaryFile)
  const summary = require(summaryFile)
  const newPost = await getMdPost(name)
  const oldPost = summary.find(post => post.name === name)
  if (oldPost) {
    Object.assign(oldPost, newPost)
    const jsonStr = JSON.stringify(summary, null, 2)
    fs.writeFileSync(summaryFile, jsonStr)
  }
}, 250)

if (process.env.npm_config_development) {
  chokidar.watch(path.resolve(__dirname, 'posts'), {
    ignoreInitial: true
  }).on('all', (event, filePath) => {
    if (event === 'change') {
      console.log(`change => `, filePath)
      const name = path.basename(filePath, path.extname(filePath))
      handleFileChange(name)
    } else if (event === 'add' || event === 'unlink') {
      updateSummary()
    }
  })
} 

updateSummary()