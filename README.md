# 如何把next.js配置成一个Markdown博客静态站点生成器

静态站点生成器SSG是介于传统静态站点和动态站点之间的一种折中解决方案。

传统意义的静态网站内容固定，而动态网站则会根据获取的数据动态的渲染内容。

SGG与上边两者的区别是SSG会提前（打包编译）获取数据，数据来源可能是通过API或者Markdown、JSON文件等等，然后根据获取的数据输出HTML静态文件。

next.js提供getStaticProps的函数能够提前获取静态数据，所以说依赖next.js创建的项目是具备成为SSG的条件的。

话多不说，直接开干。

* ## 初始化一个next.js项目

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

* ## 尝试使用getStaticProps提前获取数据

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

* ## 文章元信息（metaData）

在使用Markdown写文章的时候，为了区别文章的一些元信息和文章内容，通常会使用yaml语法来描述文章元信息。

比如，创建一片文章`/post/第一篇文章.md`:

```md
---
title: 第一篇文章
---

# 第一篇文章

第一篇文章内容
```

为了处理元信息和获取需要的Markdown内容，需要安装对应的依赖，这里选择`front-matter`。

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
                <span className={styles.date}></span>
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

* ## 渲染Markdown

npm上边提供了各种各样渲染Markdown的包，这里选择使用`react-markdown`。


回到项目，安装一下依赖`react-markdown`

```
yarn add react-markdown
```

开始改造index.js旳代码：

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
                <span className={styles.date}></span>
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

* ## 列表页面开发

通过上边一系列的尝试和反馈的结果，已经满足博客文章列表页面的开发的条件。


