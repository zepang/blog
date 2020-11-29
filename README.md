# 如何把next.js配置成一个静态站点生成器用于创建Markdown博客


* ## 初始化项目

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

接下来，创建`/posts`目录，并在该目录下添加一个Markdown的文件`index.md`：

```
# hello next.js
```

* ## 渲染Markdown -> HTML

在已经获取到Markdown内容的前提下，把Markdown内容渲染成HTML是一件非常容易的事情，比如我们可以使用`react-markdown`这个组件。

我们应该思考的是在什么时候去获取Markdown内容？

所以，我们需要提前了解以下几件事情：

1. 什么是SSG(static site generator)?

静态站点生成器SSG是介于传统静态站点和动态站点之间的一种折中解决方案。

传统意义的静态网站内容固定，而动态网站则会根据获取的数据动态的渲染内容。

SGG与上边两者的区别是SSG会提前（打包编译）获取数据，数据来源可能是通过API或者Markdown、JSON文件等等，然后根据获取的数据输出HTML静态文件。

所以，当前我们需要在打包编译的时候去获取Markdown文件的内容。

那么，next.js 有没有给我们提供便捷的方式去提前获取静态数据呢？


* ## getStaticProps

我们看下文档的介绍：

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

next.js提供getStaticProps函数来提前获取静态数据。

回到项目，安装一下依赖`react-markdown`

```
yarn add react-markdown
```

开始改造index.js旳代码：

```js
import ReactMarkdown from 'react-markdown'
import fs from 'fs'
import path from 'path'

export default function Home ({ markdown }) {
  return (<ReactMarkdown children={markdown}></ReactMarkdown>)
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

运行项目，我们就会发现HTML已经呈现出了Markdown文件内容。
