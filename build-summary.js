const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs-extra')
const { getAllMdPost } = require('./utils/post')
const debounce = require('debounce')

async function updateSummary () {
  const summayFile = path.resolve(__dirname, 'summary.json')
  await fs.ensureFile(summayFile)
  let posts = await getAllMdPost()
  let jsonStr = JSON.stringify(posts, null, 2)
  console.log(summayFile)
  fs.writeFileSync(summayFile, jsonStr)
}

console.log(process.env.npm_config_development)

const handleFileChange = debounce(async () => {
  await updateSummary()
}, 250)

if (process.env.npm_config_development) {
  chokidar.watch(path.resolve(__dirname, 'posts')).on('all', async (event, filePath) => {
    console.log(`${event} => `, filePath)
    handleFileChange()
  })
} else {
  updateSummary()
}