import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'

const postsDirectory = path.resolve(process.cwd(), 'posts')

export function getAllPosts () {
  const posts = fs.readdirSync(postsDirectory).filter(name => {
    return /\.md$/.test(path.extname(name))
  }).map(name => {
    const filename = path.basename(name, path.extname(name))
    return getPost(filename)
  })

  return posts
}

export function getPost (filename) {
  const post = fs.readFileSync(`${postsDirectory}/${filename}.md`, 'utf8')
  let { attributes, body } = frontMatter(post)

  // 确保title存在
  if (Object.prototype.toString.call(attributes) !== '[object Object]') {
    attributes = { title: filename }
  } else if (!attributes.title) {
    attributes.title = filename
  }

  attributes.filename = filename

  return {
    meta: attributes,
    content: body
  }
}