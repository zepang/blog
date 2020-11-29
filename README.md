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


### 初始化项目

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

接下来，创建`/pages/posts`目录，并在该目录下添加一个Markdown的文件`index.md`：

```
# hello next.js
```

### 渲染Markdown -> Html


