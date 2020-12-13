# 个人博客(开发中...)

基于[blog-starter-with-nextjs](https://github.com/zepang/blog-starter-with-nextjs)项目

* ## 配置tailwindcss

为了减轻一些工作量，我们选择引入tailwind.css。具体的步骤可查看其文档，也可以依照我下边的步骤来进行安装。

```
yarn add tailwindcss
```

next.js添加全局css需要在`pages/_app.js`中引入，通过脚手架创建的目录已经在该文件中引入了一个全局样式文件：

```js
import '../styles/globals.css'
```

那么，我们选在`styles/global.css`文件顶部添加引入tailwindcss:

```css
@tailwind base;

@tailwind components;

@tailwind utilities;
```

另外，我们可以在根目录下创建一个`tailwind.config.js`文件，用来自定义一些样式。

运行下边命令会自动创建该文件：

```
npx tailwindcss init
```

最后，我们还需要将tailwind.css作为postcss的一个插件，加入到打包工程中。

通过阅读next.js文档发现，其本身就集成了postcss，且有默认配置，但是，可以通过创建`postcss.config.js`来自定义配置。

为了保持默认的配置和加入tailwind.css，在`postcss.config.js`中加入如下代码：

```js
module.exports = {
  "plugins": [
    "tailwindcss",
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        "autoprefixer": {
          "flexbox": "no-2009"
        },
        "stage": 3,
        "features": {
          "custom-properties": false
        }
      }
    ]
  ]
}
```

并且，安装对应的依赖：

```
yarn add postcss-flexbugs-fixes postcss-preset-env
```

启动项目，发现提示postcss-nested插件需要postcss8.0的支持，根据提示的链接指导重新安装postcss >= 8.1和postloader >= 4.0.3

```
yarn add postcss postcss-loader -D
```

重新启动项目，并修改`pages/index.js`jsx代码，加入几个tailwindcss提供的样式class：

```js
export default function Home ({ posts }) {
  return (
    <div className={`container mx-auto px-4`}>
      <h1>#posts</h1>
      <main className={styles.main}>
        ...
      </main>
    </div>
  )
}
```

打开页面，发现样式生效，添加tailwindcss成功。


