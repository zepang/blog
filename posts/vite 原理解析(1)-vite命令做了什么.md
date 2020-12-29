---
title: vite 原理解析(1)-vite命令做了什么
date: '2020-09-10'
---

# toc

# 环境准备

- VS Code

- Node.js

- Yarn

- [vite: https://github.com/vitejs/vite](https://github.com/vitejs/vite)

# 什么是 vite ?

一个基于浏览器原生 ES imports 的开发服务器。

在项目开发模式下，vite 会根据浏览器解析 `import` 的请求，在服务端完成编译返回代码。

vite 拥有很多的特性，本文仅通过对其在 `development` 模式下相关代码进行分析和探究一些原理。

# 从 vite 命令开始

快速创建一个vite项目：

```shell
yarn create vite-app <project-name>
```

，打开 VS Code，找到项目 `node_modules/vite`（发现vite打包后的代码大部分可阅读性良好，觉得不习惯的可以使用 `npm link` 直接查看 vite 的源码），通过查看其`package.json`文件的配置，找到入口文件，通过快速的阅读，可以定位到 `vite` 命令的入口的代码如下：

```js
// node_modules/vite/dist/node/cli.js
cli
    .command('[root]') // default command
    .alias('serve')
    .option('--port <port>', `[number]  port to listen to`)
    .option('--force', `[boolean]  force the optimizer to ignore the cache and re-bundle`)
    .option('--https', `[boolean]  start the server with TLS and HTTP/2 enabled`)
    .option('--open', `[boolean]  open browser on server start`)
    .action(async (root, argv) => {
    if (root) {
        argv.root = root;
    }
    
    const options = await resolveOptions({ argv, defaultMode: 'development' });
    return runServe(options);
});
```

通过一些字面理解，运行 `vite` 命令主要会做两件事：

- 获取配置

- 启动服务


在获取配置之前的位置打一个断点，打开 VS Code 的调试终端，运行：

```
npm run dev
```

# vite 获取配置过程分析

```js
async function resolveConfig(mode, configPath) {
    const start = Date.now();
    const cwd = process.cwd();
    let resolvedPath;
    let isTS = false;
    if (configPath) {
        // 获取用户自定义的配置文件路径
        resolvedPath = path_1.default.resolve(cwd, configPath);
    }
    else {
        // 用户未配置 resolvedPath 的情况下，定位跟目录是否有 'vite.config.js'
        const jsConfigPath = path_1.default.resolve(cwd, 'vite.config.js');
        if (fs_extra_1.default.existsSync(jsConfigPath)) {
            resolvedPath = jsConfigPath;
        }
        else {
            // 用户未配置 resolvedPath 的情况下，定位跟目录是否有 'vite.config.ts'
            const tsConfigPath = path_1.default.resolve(cwd, 'vite.config.ts');
            if (fs_extra_1.default.existsSync(tsConfigPath)) {
                isTS = true;
                resolvedPath = tsConfigPath;
            }
        }
    }
    if (!resolvedPath) {
        // 没有任何配置文件的情况下直接读取 env 文件的配置，并返回
        return {
            env: loadEnv(mode, cwd)
        };
    }
    try {
        let userConfig;
        if (!isTS) {
            try {
                // 获取 vite.config.js 的配置
                userConfig = require(resolvedPath);
            }
        }
        if (!userConfig) {
            // 获取 vit.config.ts的配置
        }
        
        config.__path = resolvedPath;
        return config;
    }
}
```

配置文件的获取没有什么好说的，关键的注释我都写在上边了

# vite 启动服务过程分析

`node_modules/vite/dist/node/server/index.js`中暴露了一个 `createServer` 用来创建服务实例，代码如下：

```js
function createServer(config) {
    const { root = process.cwd(), configureServer = [], resolvers = [], alias = {}, transforms = [], vueCustomBlockTransforms = {}, optimizeDeps = {}, enableEsbuild = true, assetsInclude } = config;
    const app = new koa_1.default();

    const server = resolveServer(config, app.callback());

    const watcher = chokidar_1.default.watch(root, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        // #610
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 10
        }
    });

    const resolver = resolver_1.createResolver(root, resolvers, alias, assetsInclude);
    const context = {
        root,
        app,
        server,
        watcher,
        resolver,
        config,
        // port is exposed on the context for hmr client connection
        // in case the files are served under a different port
        port: config.port || 3000
    };
    // attach server context to koa context
    app.use((ctx, next) => {
        Object.assign(ctx, context);
        ctx.read = utils_1.cachedRead.bind(null, ctx);
        return next();
    });
    // cors
    if (config.cors) {
        app.use(require('@koa/cors')(typeof config.cors === 'boolean' ? {} : config.cors));
    }
    const resolvedPlugins = [
        // 配置各种插件
    ];

    resolvedPlugins.forEach((m) => m && m(context));

    const listen = server.listen.bind(server);
    server.listen = (async (port, ...args) => {
        if (optimizeDeps.auto !== false) {
            await require('../optimizer').optimizeDeps(config);
        }
        return listen(port, ...args);
    });
    server.once('listening', () => {
        context.port = server.address().port;
    });
    return server;
}
```

通过代码分析，`createServer` 函数大概做了一下几件事：

- 为了获得使用中间件的能力，创建 koa的 实例

- 使用 `chokidar` 创建一个 `watcher`

- 将 `root, app, server, watcher, resolver, config, port` 挂载到 koa 上下文对象

- 配置和挂载各种vite服务插件

```js
 const resolvedPlugins = [
    // 生成sourceMap插件
    sourceMapPlugin,
    // 重写模块中import的导入
    moduleRewritePlugin,
    // 重写html中script的内容
    htmlRewritePlugin,
    // 用户定义的插件
    ...toArray(configureServer),
    // /vite/env 返回环境变量插件
    envPlugin,
    // 获取模块内容插件
    moduleResolvePlugin,
    // 代理插件
    proxyPlugin,
    clientPlugin,
    // 热更新插件
    hmrPlugin,
    ...(transforms.length || Object.keys(vueCustomBlockTransforms).length
      ? [
          createServerTransformPlugin(
            transforms,
            vueCustomBlockTransforms,
            resolver
          )
        ]
      : []),
    // vue文件处理插件
    vuePlugin,
    // css 资源处理
    cssPlugin,
    // esbuild处理资源插件
    enableEsbuild ? esbuildPlugin : null,
    // JSON 资源处理插件
    jsonPlugin,
    // 处理静态资源插件
    assetPathPlugin,
    // 处理 webWorker 插件
    webWorkerPlugin,
    // 处理 wasm 插件
    wasmPlugin,
    // 静态资源服务插件
    serveStaticPlugin
  ]
```

当服务运行起来之后，等待资源请求，然后针对不同的请求走对应的插件处理和返回内容就完了。
