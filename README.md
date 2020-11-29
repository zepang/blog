This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# How to useing next.js as static generator for creating markdown blog?


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
