---
title: 使用 Next.js SSG 和 Markdown 创建博客
date: '2020-11-29'
---
# toc

# 环境准备

- Node.js 

- Npm, npx

- VS Code

# 什么是 SSG？

静态站点生成器SSG是介于传统静态站点和动态站点之间的一种折中解决方案。

传统意义的静态网站内容固定，而动态网站则会根据获取的数据动态的渲染内容。

SGG与上边两者的区别是SSG会提前（打包编译）获取数据，数据来源可能是通过API或者Markdown、JSON文件等等，然后根据获取的数据输出HTML静态文件。

next.js9.3版本宣布支持SSG，具体查看该文章[https://nextjs.org/blog/next-9-3#next-gen-static-site-generation-ssg-support](https://nextjs.org/blog/next-9-3#next-gen-static-site-generation-ssg-support)。

本文将尝试配置一个 Next.js SSG Blog Starter 项目，并基于该项目创建个人博客。

# 初始化一个next.js项目

打开next.js的文档，按照步骤快速创建一个next.js应用

```
npx create-next-app

# 文件目录如下
.
├── README.md
├── package.json
├── pages
├── public
├── styles
└── yarn.lock
```

创建完成之后我们先进入目录，启动一下项目，确保没有问题

# 尝试使用getStaticProps提前获取数据

看下官方文档对getStaticProps函数的描述：

```
If you export an async function called getStaticProps from a page, Next.js will pre-render this page at build time using the props returned by getStaticProps.
```

```js
export async function getStaticProps(context) {
  return {
    props: {}, // will be passed to the page component as props
  }
}
```

接下来，创建`/posts`目录，并在该目录下添加一个Markdown的文件`index.md`：

```
# hello next.js
```

改造`index.js`的内容：

```js
import fs from 'fs'
import path from 'path'

export default function Home ({ markdown }) {
  return (<h1>{markdown}</h1>)
}

export async function getStaticProps () {
  const markdown = fs.readFileSync(path.resolve(process.cwd(), 'posts/index.md'), 'utf8')
  
  return {
    props: {
      markdown
    }
  }
}
```

打开浏览器，可以看到标题`# hello next.js`，成功的拿到了数据。

# 获取文章元信息（metaData）和内容

在使用Markdown写文章的时候，为了区别文章的一些元信息和文章内容，通常会使用yaml语法来描述文章元信息。

比如，创建一片文章`/post/第一篇文章.md`:

```md
---
title: 第一篇文章
---

# 第一篇文章

第一篇文章内容
```

我们使用`front-matter`处理元信息和获取需要的Markdown内容

```
yarn add front-matter
```

下面是改造后的`index.js`文件内容:

```js
import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'

export default function Home ({ posts }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ul>
          {
            posts.map(post => (
              <li key={post}>
                <span className={styles.titleWrapper}>
                  <a className={styles.title}>{post.meta.title}</a>
                </span>
                <span className={styles.date}>{post.meta.date}</span>
             </li>
            ))
          }
        </ul>
      </main>
    </div>
  )
}

export async function getStaticProps () {
  const postsDirectory = path.resolve(process.cwd(), 'posts')
  const posts = fs.readdirSync(postsDirectory).filter(name => {
    return /\.md$/.test(path.extname(name))
  }).map(name => {
    const post = fs.readFileSync(`${postsDirectory}/${name}`, 'utf8')
    let { attributes, body } = frontMatter(post)

    // 确保title存在
    if (Object.prototype.toString.call(attributes) !== '[object Object]') {
      attributes = { title: path.basename(name, path.extname(name)) }
    } else if (!attributes.title) {
      attributes.title = path.basename(name, path.extname(name))
    }

    return {
      meta: attributes,
      content: body
    }
  })
  
  return {
    props: {
      posts
    }
  }
}
```

打开页面，可以看到文章的标题

# 使用 react-markdown 渲染Markdown

安装依赖`react-markdown`

```
yarn add react-markdown
```

改造index.js旳代码：

```js
import ReactMarkdown from 'react-markdown'
...

export default function Home ({ posts }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ul>
          {
            posts.map(post => (
              <li key={post}>
                <span className={styles.titleWrapper}>
                  <a className={styles.title}>{post.meta.title}</a>
                </span>
                <span className={styles.date}>{post.meta.date}</span>
             </li>
            ))
          }
        </ul>
        // 文章内容
        <ReactMarkdown children={markdown}></ReactMarkdown>
      </main>
    </div>
  )
}

...
```

重新运行项目，页面已经呈现出了Markdown文件内容。

# 使用Next.js动态路由

SSG打包出来的都是静态页面，也就是说需要为每个Markdown文章页输出一个HTML文章页，通过访问URL上的静态文件名来访问HTML页面。

为了达到这个效果，需要用到next.js的动态路由和`getStaticPaths`函数，你也可以使用通过在`next.config.js`中配置`exportPathMap`来替换`getStaticPaths`函数的作用。

先来尝试一下next.js的动态路由，创建`pages/post/[postName].js`：

```js
import { useRouter } from 'next/router'
export default function post () {
  const router = useRouter()
  return (<h1>这是文章{router.query.postName}的详情页面</h1>)
}
```

之后可以通过`localhost:3000/post/:postName`来访问页面，并且可以通过`next/router`的`useRouter` hooks创建的router对象获取 `postName` 的值。

在改造`pages/post/[postName].js`之前，先把`index.js`文件中的一些通用方法提到`/utils/index.js`文件中：

```js
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
```

接下来在`pages/post/[postName].js`加入`getStaticPaths`函数和`getStaticProps函数`：

```js
import { useRouter } from 'next/router'
import { getAllPosts, getPost } from '../../utils'
import ReactMarkdown from 'react-markdown'

export default function post ({ post = {} }) {
  const router = useRouter()

  return (
    <div>
      <h1>这是文章{router.query.postName}的详情页面</h1>
      {post.content && (<ReactMarkdown children={post.content}></ReactMarkdown>)}
    </div>
  ) 
}

export async function getStaticProps (contxt) {
  let post = getPost(contxt.params.postName)

  return {
    props: {
      post
    }
  }
}

export async function getStaticPaths () {
  const posts = getAllPosts()
  const paths = posts.map(post => {
    return {
      params: { 
        // 兼容中文命名需要使用 encodeURIComponent，否则无法根据URL的文件名找到对应文件
        postName: encodeURIComponent(post.meta.filename) 
      }
    }
  })

  return {
    paths,
    // 不存在的文章显示404
    fallback: false
  }
} 
```

目前已经可以通过访问`localhost:3000/post/:postName`正确的展示Markdown文章页面和内容。

# 添加markdown代码块的语法高亮

`react-markdown` 默认没有语法高亮，语法高亮需要用到另外一个依赖 `react-syntax-highlighter`

```
yarn add react-syntax-highlighter
```

关于 `react-syntax-highlighter` 的使用这里不做过多说明，具体的话去查看对应的文档即可。

为了使的 `react-syntax-highlighter` 配合 `react-markdown`，需要使用`react-markdown`的自定义`renderers`，文档也有提到相关的内容。

修改`pages/post/[postName].js`的代码，针对`code`标签的内容交给`CodeBlock`组件处理：

```js
...
{post.content && (<ReactMarkdown children={post.content} renderers={{ code: CodeBlock }}></ReactMarkdown>)}
...
```

创建文件`components/CodeBlock.js`: 

```js
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const CodeBlock = (props) => {
  const { language, value } = props
  return (
    <SyntaxHighlighter language={language} style={okaidia}>
      {value}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
```

这样markdown中代码块的语法高亮就处理完了。
