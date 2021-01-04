---
title: vite 原理解析(2)-重写npm模块(moduleRewritePlugin)和@modules
date: '2020-09-18'
---

# toc

# 环境准备

- VS Code

- Node.js

- Yarn

# ES modules

关于 ES modules ，文章不做过多的介绍，具体请查看 [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

接着上一篇文章的进度，在浏览器中访问`locahost:3000`，查看一下`index.html`的代码：

![](/images/vite-es-modules-html.png)

`script`标签指定了`type="module"`告知浏览器这是一个模块，找到控制台的`network > js`，在请求资源中查看一下`main.js`的代码：

![](/images/vite-es-modules-main.jpg)

代码中直接使用`import`关键字去导入`vue`，同时，浏览器会以发出请求加载该资源

![](/images/vite-es-modules-request-vue.jpg)

# 重写依赖路径 -> @modules

通过上边的一个截图，可以发现浏览器加载的`main.js`中导出`vue`的代码和源代码并不一致：

```js
// source
import vue from 'vue'

// loaded
import vue from '@modules/vue
```

上一篇文章中有提到一个插件`moduleRewritePlugin`:

```js
// Plugin for rewriting served js.
// - Rewrites named module imports to `/@modules/:id` requests, e.g.
//   "vue" => "/@modules/vue"
// - Rewrites files containing HMR code (reference to `import.meta.hot`) to
//   inject `import.meta.hot` and track HMR boundary accept whitelists.
// - Also tracks importer/importee relationship graph during the rewrite.
//   The graph is used by the HMR plugin to perform analysis on file change.
const moduleRewritePlugin = ({ root, app, watcher, resolver }) => {
    app.use(async (ctx, next) => {
        await next();
        if (ctx.status === 304) {
            return;
        }
        // we are doing the js rewrite after all other middlewares have finished;
        // this allows us to post-process javascript produced by user middlewares
        // regardless of the extension of the original files.
        const publicPath = ctx.path;
        if (ctx.body &&
            ctx.response.is('js') &&
            !cssUtils_1.isCSSRequest(ctx.path) &&
            !ctx.url.endsWith('.map') &&
            !resolver.isPublicRequest(ctx.path) &&
            // skip internal client
            publicPath !== serverPluginClient_1.clientPublicPath &&
            // need to rewrite for <script>\<template> part in vue files
            !((ctx.path.endsWith('.vue') || ctx.vue) && ctx.query.type === 'style')) {
            const content = await utils_1.readBody(ctx.body);
            const cacheKey = publicPath + content;
            const isHmrRequest = !!ctx.query.t;
            if (!isHmrRequest && rewriteCache.has(cacheKey)) {
                debug(`(cached) ${ctx.url}`);
                ctx.body = rewriteCache.get(cacheKey);
            }
            else {
                await es_module_lexer_1.init;
                // dynamic import may contain extension-less path,
                // (.e.g import(runtimePathString))
                // so we need to normalize importer to ensure it contains extension
                // before we perform hmr analysis.
                // on the other hand, static import is guaranteed to have extension
                // because they must all have gone through module rewrite.
                const importer = utils_1.removeUnRelatedHmrQuery(resolver.normalizePublicPath(ctx.url));
                ctx.body = rewriteImports(root, content, importer, resolver, ctx.query.t);
                if (!isHmrRequest) {
                    rewriteCache.set(cacheKey, ctx.body);
                }
            }
        }
        else {
            debug(`(skipped) ${ctx.url}`);
        }
    });
    // ...
};
```

源代码的以协注释解释了该插件会重写`js`文件中模块导入，并且还特意提供了例子 "vue" => "/@modules/vue"，`import vue from 'vue'`这样的导入模块的代码将会被重写为`import vue from '@modules/vue`。

可以看下具体的代码：

```js
function rewriteImports(root, source, importer, resolver, timestamp) {
    // #806 strip UTF-8 BOM
    if (source.charCodeAt(0) === 0xfeff) {
        source = source.slice(1);
    }
    try {
        let imports = [];
        try {
          // es-module-lerxer
            imports = es_module_lexer_1.parse(source)[0];
        }
        catch (e) {
            // ...
        }
        const hasHMR = source.includes('import.meta.hot');
        const hasEnv = source.includes('import.meta.env');
        if (imports.length || hasHMR || hasEnv) {
            debug(`${importer}: rewriting`);
            const s = new magic_string_1.default(source);
            let hasReplaced = false;
            const prevImportees = serverPluginHmr_1.importeeMap.get(importer);
            const currentImportees = new Set();
            serverPluginHmr_1.importeeMap.set(importer, currentImportees);
            for (let i = 0; i < imports.length; i++) {
                const { s: start, e: end, d: dynamicIndex, ss: expStart, se: expEnd } = imports[i];
                let id = source.substring(start, end);
                const hasViteIgnore = /\/\*\s*@vite-ignore\s*\*\//.test(id);
                // ...
                if (dynamicIndex === -1 || hasLiteralDynamicId) {
                    // do not rewrite external imports
                    if (utils_1.isExternalUrl(id)) {
                        continue;
                    }
                    const resolved = exports.resolveImport(root, importer, id, resolver, timestamp);
                    if (resolved !== id) {
                        debug(`    "${id}" --> "${resolved}"`);
                        if (isOptimizedCjs(root, id)) {
                            if (dynamicIndex === -1) {
                                const exp = source.substring(expStart, expEnd);
                                const replacement = transformCjsImport(exp, id, resolved, i);
                                s.overwrite(expStart, expEnd, replacement);
                            }
                            else if (hasLiteralDynamicId) {
                                // rewrite `import('package')`
                                s.overwrite(dynamicIndex, end + 1, `import('${resolved}').then(m=>m.default)`);
                            }
                        }
                        else {
                            s.overwrite(start, end, hasLiteralDynamicId ? `'${resolved}'` : resolved);
                        }
                        hasReplaced = true;
                    }
                    // save the import chain for hmr analysis
                    const importee = utils_1.cleanUrl(resolved);
                    if (importee !== importer &&
                        // no need to track hmr client or module dependencies
                        importee !== serverPluginClient_1.clientPublicPath) {
                        currentImportees.add(importee);
                        serverPluginHmr_1.debugHmr(`        ${importer} imports ${importee}`);
                        serverPluginHmr_1.ensureMapEntry(serverPluginHmr_1.importerMap, importee).add(importer);
                    }
                }
                else if (id !== 'import.meta' && !hasViteIgnore) {
                    console.warn(chalk_1.default.yellow(`[vite] ignored dynamic import(${id}) in ${importer}.`));
                }
            }
            // ..
            return hasReplaced ? s.toString() : source;
        }
        else {
            debug(`${importer}: no imports found.`);
        }
        return source;
    }
    catch (e) {
        // ...
    }
}

const resolveImport = (root, importer, id, resolver, timestamp) => {
    id = resolver.alias(id) || id;
    if (utils_1.bareImportRE.test(id)) {
        // directly resolve bare module names to its entry path so that relative
        // imports from it (including source map urls) can work correctly
        id = `/@modules/${resolver_1.resolveBareModuleRequest(root, id, importer, resolver)}`;
    }
    else {
        // 1. relative to absolute
        //    ./foo -> /some/path/foo
        let { pathname, query } = resolver.resolveRelativeRequest(importer, id);
        // 2. resolve dir index and extensions.
        pathname = resolver.normalizePublicPath(pathname);
        // 3. mark non-src imports
        if (!query && path_1.default.extname(pathname) && !resolver_1.jsSrcRE.test(pathname)) {
            query += `?import`;
        }
        id = pathname + query;
    }
    // 4. force re-fetch dirty imports by appending timestamp
    if (timestamp) {
        const dirtyFiles = serverPluginHmr_1.hmrDirtyFilesMap.get(timestamp);
        const cleanId = utils_1.cleanUrl(id);
        // only rewrite if:
        if (dirtyFiles && dirtyFiles.has(cleanId)) {
            // 1. this is a marked dirty file (in the import chain of the changed file)
            id += `${id.includes(`?`) ? `&` : `?`}t=${timestamp}`;
        }
        else if (serverPluginHmr_1.latestVersionsMap.has(cleanId)) {
            // 2. this file was previously hot-updated and has an updated version
            id += `${id.includes(`?`) ? `&` : `?`}t=${serverPluginHmr_1.latestVersionsMap.get(cleanId)}`;
        }
    }
    return id;
};
```

代码总体大概的步骤：

1. 使用 `es-module-lexer` 解析 `js` 拿到 import 的内容

```js
// ...
await es_module_lexer_1.init;
// ...
imports = es_module_lexer_1.parse(source)[0];
// ...
let id = source.substring(start, end);
```

2. 判断 `import` 资源的路径是否是绝对路径，是的话是为`npm`的模块

```js
// ...
utils_1.bareImportRE.test(id)
```

3. 返回`vue`的模块导入路径 'vue' => '@modules/vue'，然后使用 `magic-string` 进行重写并返回结果

```js
const magic_string_1 = __importDefault(require("magic-string"));
// ...
const s = new magic_string_1.default(source);
// ...
s.overwrite(start, end, hasLiteralDynamicId ? `'${resolved}'` : resolved);
// ...
return hasReplaced ? s.toString() : source;
// ...
ctx.body = rewriteImports(root, content, importer, resolver, ctx.query.t);
```

# @module/vue.js 在哪？

当浏览器发起请求`localhost:3000/@modules/vue.js`，会经过插件`moduleResolvePlugin`，下边是其完整的代码：

```js
// plugin for resolving /@modules/:id requests.
export const moduleResolvePlugin: ServerPlugin = ({ root, app, resolver }) => {
  const vueResolved = resolveVue(root)

  app.use(async (ctx, next) => {
    if (!moduleRE.test(ctx.path)) {
      return next()
    }

    // path maybe contain encode chars
    const id = decodeURIComponent(ctx.path.replace(moduleRE, ''))
    ctx.type = 'js'

    const serve = async (id: string, file: string, type: string) => {
      moduleIdToFileMap.set(id, file)
      moduleFileToIdMap.set(file, ctx.path)
      debug(`(${type}) ${id} -> ${getDebugPath(root, file)}`)
      await ctx.read(file)
      return next()
    }

    // special handling for vue runtime in case it's not installed
    if (!vueResolved.isLocal && id in vueResolved) {
      return serve(id, (vueResolved as any)[id], 'non-local vue')
    }

    // already resolved and cached
    const cachedPath = moduleIdToFileMap.get(id)
    if (cachedPath) {
      return serve(id, cachedPath, 'cached')
    }

    // resolve from vite optimized modules
    const optimized = resolveOptimizedModule(root, id)
    if (optimized) {
      return serve(id, optimized, 'optimized')
    }

    const referer = ctx.get('referer')
    let importer: string | undefined
    // this is a map file request from browser dev tool
    const isMapFile = ctx.path.endsWith('.map')
    if (referer) {
      importer = new URL(referer).pathname
    } else if (isMapFile) {
      // for some reason Chrome doesn't provide referer for source map requests.
      // do our best to reverse-infer the importer.
      importer = ctx.path.replace(/\.map$/, '')
    }

    const importerFilePath = importer ? resolver.requestToFile(importer) : root
    // #829 node package has sub-package(has package.json), should check it before `resolveNodeModuleFile`
    const nodeModuleInfo = resolveNodeModule(root, id, resolver)
    if (nodeModuleInfo) {
      return serve(id, nodeModuleInfo.entryFilePath!, 'node_modules')
    }

    const nodeModuleFilePath = resolveNodeModuleFile(importerFilePath, id)
    if (nodeModuleFilePath) {
      return serve(id, nodeModuleFilePath, 'node_modules')
    }

    if (isMapFile && importer) {
      // the resolveNodeModuleFile doesn't work with linked pkg
      // our last try: infer from the dir of importer
      const inferMapPath = path.join(
        path.dirname(importerFilePath),
        path.basename(ctx.path)
      )
      if (fs.existsSync(inferMapPath)) {
        return serve(id, inferMapPath, 'map file in linked pkg')
      }
    }

    console.error(
      chalk.red(
        `[vite] Failed to resolve module import "${id}". ` +
          `(imported by ${importer || 'unknown'})`
      )
    )
    ctx.status = 404
  })
}
```

查看注释发现下边代码：

```js
const serve = async (id: string, file: string, type: string) => {
    moduleIdToFileMap.set(id, file)
    moduleFileToIdMap.set(file, ctx.path)
    debug(`(${type}) ${id} -> ${getDebugPath(root, file)}`)
    await ctx.read(file)
    return next()
}

// ...

// resolve from vite optimized modules
const optimized = resolveOptimizedModule(root, id)
if (optimized) {
    return serve(id, optimized, 'optimized')
}
```

通过`serve`函数可以猜测一下 `const optimized` 应该是返回的是文件的路径，找到`resolveOptimizedModule`函数：

```js
export function resolveOptimizedModule(
  root: string,
  id: string
): string | undefined {
  const cacheKey = `${root}#${id}`
  const cached = viteOptimizedMap.get(cacheKey)
  if (cached) {
    return cached
  }

  const cacheDir = resolveOptimizedCacheDir(root)
  if (!cacheDir) return

  const tryResolve = (file: string) => {
    file = path.join(cacheDir, file)
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      viteOptimizedMap.set(cacheKey, file)
      return file
    }
  }

  return tryResolve(id) || tryResolve(id + '.js')
}
```

果然如此，返回的就是文件的路径。

接下来，找下`const cacheDir = resolveOptimizedCacheDir(root)`中的`resolveOptimizedCacheDir`看下文件目录

```js
export const OPTIMIZE_CACHE_DIR = `node_modules/.vite_opt_cache`
// ...
export function resolveOptimizedCacheDir(
  root: string,
  pkgPath?: string
): string | null {
  const cached = cacheDirCache.get(root)
  if (cached !== undefined) return cached
  pkgPath = pkgPath || lookupFile(root, [`package.json`], true /* pathOnly */)
  if (!pkgPath) {
    return null
  }
  const cacheDir = path.join(path.dirname(pkgPath), OPTIMIZE_CACHE_DIR)
  cacheDirCache.set(root, cacheDir)
  return cacheDir
}
```

发现文件目录是`node_modules/.vite_opt_cache`。

打开对应目录查可以看到对应的文件`vue.js`：

![](/images/vite-es-modules-tree.png)

之后就简单了，`serve`函数将会使用`ctx.read`也就是`cachedRead`读取文件，然后缓存，然后返回结果。具体的代码我也贴一下：

```js
/**
 * Read a file with in-memory cache.
 * Also sets appropriate headers and body on the Koa context.
 * This is exposed on middleware context as `ctx.read` with the `ctx` already
 * bound, so it can be used as `ctx.read(file)`.
 */
export async function cachedRead(
  ctx: Context | null,
  file: string,
  poll = false
): Promise<Buffer> {
  const lastModified = fs.statSync(file).mtimeMs
  const cached = fsReadCache.get(file)
  if (ctx) {
    ctx.set('Cache-Control', 'no-cache')
    ctx.type = mime.lookup(path.extname(file)) || 'application/octet-stream'
  }
  if (cached && cached.lastModified === lastModified) {
    if (ctx) {
      // a private marker in case the user ticks "disable cache" during dev
      ctx.__notModified = true
      ctx.etag = cached.etag
      ctx.lastModified = new Date(cached.lastModified)
      if (ctx.get('If-None-Match') === ctx.etag && seenUrls.has(ctx.url)) {
        ctx.status = 304
      }
      seenUrls.add(ctx.url)
      ctx.body = cached.content
    }
    return cached.content
  }
  // #395 some file is an binary file, eg. font
  let content = await fs.readFile(file)
  if (poll && !content.length) {
    await untilModified(file)
    content = await fs.readFile(file)
  }
  // Populate the "sourcesContent" array and resolve relative paths in the
  // "sources" array, so the debugger can trace back to the original source.
  if (file.endsWith('.map')) {
    const map: RawSourceMap = JSON.parse(content.toString('utf8'))
    if (!map.sourcesContent || !map.sources.every(path.isAbsolute)) {
      const sourcesContent = map.sourcesContent || []
      const sourceRoot = path.resolve(path.dirname(file), map.sourceRoot || '')
      map.sources = await Promise.all(
        map.sources.map(async (source, i) => {
          const originalPath = path.resolve(sourceRoot, source)
          if (!sourcesContent[i]) {
            try {
              sourcesContent[i] = (
                await cachedRead(null, originalPath)
              ).toString('utf8')
            } catch (err) {
              if (err.code === 'ENOENT') {
                console.error(
                  chalk.red(
                    `[vite] Sourcemap "${file}" points to non-existent source: "${originalPath}"`
                  )
                )
                return source
              }
              throw err
            }
          }
          return originalPath
        })
      )
      map.sourcesContent = sourcesContent
      content = Buffer.from(JSON.stringify(map))
    }
  }
  const etag = getETag(content)
  fsReadCache.set(file, {
    content,
    etag,
    lastModified
  })
  if (ctx) {
    ctx.etag = etag
    ctx.lastModified = new Date(lastModified)
    ctx.body = content
    ctx.status = 200

    // watch the file if it's out of root.
    const { root, watcher } = ctx
    watchFileIfOutOfRoot(watcher, root, file)
  }
  return content
}
```

# @modules/vue.js 是何时生成的？

在创建 vite server 的代码的时候，`createServer`会重新`server.listen`方法

```js
function createServer(config) {
    // ...
    server.listen = (async (port, ...args) => {
        if (optimizeDeps.auto !== false) {
            await require('../optimizer').optimizeDeps(config);
        }
        return listen(port, ...args);
    });
    // ...
    return server;
}
```

没错，`vue.js`这一类的npm模块就是在`optimizeDeps`内进行打包输出到`node_modules/.vite_opt_cache`，找到 `optimizeDeps`:

```js
async function optimizeDeps(config, asCommand = false) {
    const log = asCommand ? console.log : debug;
    const root = config.root || process.cwd();
    // warn presence of web_modules
    if (fs_extra_1.default.existsSync(path_1.default.join(root, 'web_modules'))) {
        console.warn(chalk_1.default.yellow(`[vite] vite 0.15 has built-in dependency pre-bundling and resolving ` +
            `from web_modules is no longer supported.`));
    }
    const pkgPath = utils_1.lookupFile(root, [`package.json`], true /* pathOnly */);
    if (!pkgPath) {
        log(`package.json not found. Skipping.`);
        return;
    }
    const cacheDir = resolveOptimizedCacheDir(root, pkgPath);
    const hashPath = path_1.default.join(cacheDir, 'hash');
    const depHash = getDepHash(root, config.__path);
    if (!config.force) {
        let prevhash;
        try {
            prevhash = await fs_extra_1.default.readFile(hashPath, 'utf-8');
        }
        catch (e) { }
        // hash is consistent, no need to re-bundle
        if (prevhash === depHash) {
            log('Hash is consistent. Skipping. Use --force to override.');
            return;
        }
    }
    await fs_extra_1.default.remove(cacheDir);
    await fs_extra_1.default.ensureDir(cacheDir);
    const options = config.optimizeDeps || {};
    const resolver = resolver_1.createResolver(root, config.resolvers, config.alias, config.assetsInclude);
    // Determine deps to optimize. The goal is to only pre-bundle deps that falls
    // under one of the following categories:
    // 1. Has imports to relative files (e.g. lodash-es, lit-html)
    // 2. Has imports to bare modules that are not in the project's own deps
    //    (i.e. esm that imports its own dependencies, e.g. styled-components)
    await es_module_lexer_1.init;
    const { qualified, external } = resolveQualifiedDeps(root, options, resolver);
    // Resolve deps from linked packages in a monorepo
    if (options.link) {
        options.link.forEach((linkedDep) => {
            const depRoot = path_1.default.dirname(utils_1.resolveFrom(root, `${linkedDep}/package.json`));
            const { qualified: q, external: e } = resolveQualifiedDeps(depRoot, options, resolver);
            Object.keys(q).forEach((id) => {
                if (!qualified[id]) {
                    qualified[id] = q[id];
                }
            });
            e.forEach((id) => {
                if (!external.includes(id)) {
                    external.push(id);
                }
            });
        });
    }
    // Force included deps - these can also be deep paths
    if (options.include) {
        options.include.forEach((id) => {
            const pkg = resolver_1.resolveNodeModule(root, id, resolver);
            if (pkg && pkg.entryFilePath) {
                qualified[id] = pkg.entryFilePath;
            }
            else {
                const filePath = resolver_1.resolveNodeModuleFile(root, id);
                if (filePath) {
                    qualified[id] = filePath;
                }
            }
        });
    }
    if (!Object.keys(qualified).length) {
        await fs_extra_1.default.writeFile(hashPath, depHash);
        log(`No listed dependency requires optimization. Skipping.`);
        return;
    }
    if (!asCommand) {
        // This is auto run on server start - let the user know that we are
        // pre-optimizing deps
        console.log(chalk_1.default.greenBright(`[vite] Optimizable dependencies detected:`));
        console.log(Object.keys(qualified)
            .map((id) => chalk_1.default.yellow(id))
            .join(`, `));
    }
    let spinner;
    const msg = asCommand
        ? `Pre-bundling dependencies to speed up dev server page load...`
        : `Pre-bundling them to speed up dev server page load...\n` +
            `(this will be run only when your dependencies have changed)`;
    if (process.env.DEBUG || process.env.NODE_ENV === 'test') {
        console.log(msg);
    }
    else {
        spinner = require('ora')(msg + '\n').start();
    }
    const { pluginsPreBuild, pluginsPostBuild, pluginsOptimizer = [], ...rollupInputOptions } = config.rollupInputOptions || {};

    try {
        const rollup = require('rollup');
        const bundle = await rollup.rollup({
            input: qualified,
            external,
            // treeshake: { moduleSideEffects: 'no-external' },
            onwarn: build_1.onRollupWarning(spinner, options),
            ...rollupInputOptions,
            plugins: [
                pluginAssets_1.createDepAssetExternalPlugin(resolver),
                entryAnalysisPlugin_1.entryAnalysisPlugin(),
                ...(await build_1.createBaseRollupPlugins(root, resolver, config)),
                pluginAssets_1.createDepAssetPlugin(resolver, root),
                ...pluginsOptimizer
            ]
        });
        const { output } = await bundle.generate({
            ...config.rollupOutputOptions,
            format: 'es',
            exports: 'named',
            entryFileNames: '[name].js',
            chunkFileNames: 'common/[name]-[hash].js'
        });
        spinner && spinner.stop();
        for (const chunk of output) {
            if (chunk.type === 'chunk') {
                const fileName = chunk.fileName;
                const filePath = path_1.default.join(cacheDir, fileName);
                await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
                await fs_extra_1.default.writeFile(filePath, chunk.code);
            }
            if (chunk.type === 'asset' && chunk.fileName === '_analysis.json') {
                const filePath = path_1.default.join(cacheDir, chunk.fileName);
                await fs_extra_1.default.writeFile(filePath, chunk.source);
            }
        }
        await fs_extra_1.default.writeFile(hashPath, depHash);
    }
    catch (e) {
        spinner && spinner.stop();
        if (asCommand) {
            throw e;
        }
        else {
            console.error(chalk_1.default.red(`\n[vite] Dep optimization failed with error:`));
            console.error(chalk_1.default.red(e.message));
            if (e.code === 'PARSE_ERROR') {
                console.error(chalk_1.default.cyan(path_1.default.relative(root, e.loc.file)));
                console.error(chalk_1.default.dim(e.frame));
            }
            else if (e.message.match('Node built-in')) {
                console.log();
                console.log(chalk_1.default.yellow(`Tip:\nMake sure your "dependencies" only include packages that you\n` +
                    `intend to use in the browser. If it's a Node.js package, it\n` +
                    `should be in "devDependencies".\n\n` +
                    `If you do intend to use this dependency in the browser and the\n` +
                    `dependency does not actually use these Node built-ins in the\n` +
                    `browser, you can add the dependency (not the built-in) to the\n` +
                    `"optimizeDeps.allowNodeBuiltins" option in vite.config.js.\n\n` +
                    `If that results in a runtime error, then unfortunately the\n` +
                    `package is not distributed in a web-friendly format. You should\n` +
                    `open an issue in its repo, or look for a modern alternative.`)
                // TODO link to docs once we have it
                );
            }
            else {
                console.error(e);
            }
            process.exit(1);
        }
    }
}
```

`resolveQualifiedDeps`函数将获取需要rollup处理的依赖，其获取依赖的逻辑如下：

```js
function resolveQualifiedDeps(root, options, resolver) {
    const { include, exclude, link } = options;
    const pkgContent = utils_1.lookupFile(root, ['package.json']);
    if (!pkgContent) {
        return {
            qualified: {},
            external: []
        };
    }
    const pkg = JSON.parse(pkgContent);
    const deps = Object.keys(pkg.dependencies || {});
    const qualifiedDeps = deps.filter((id) => {
        if (include && include.includes(id)) {
            // already force included
            return false;
        }
        if (exclude && exclude.includes(id)) {
            debug(`skipping ${id} (excluded)`);
            return false;
        }
        if (link && link.includes(id)) {
            debug(`skipping ${id} (link)`);
            return false;
        }
        if (KNOWN_IGNORE_LIST.has(id)) {
            debug(`skipping ${id} (internal excluded)`);
            return false;
        }
        // #804
        if (id.startsWith('@types/')) {
            debug(`skipping ${id} (ts declaration)`);
            return false;
        }
        const pkgInfo = resolver_1.resolveNodeModule(root, id, resolver);
        if (!pkgInfo || !pkgInfo.entryFilePath) {
            debug(`skipping ${id} (cannot resolve entry)`);
            console.log(root, id);
            console.error(chalk_1.default.yellow(`[vite] cannot resolve entry for dependency ${chalk_1.default.cyan(id)}.`));
            return false;
        }
        const { entryFilePath } = pkgInfo;
        if (!resolver_1.supportedExts.includes(path_1.default.extname(entryFilePath))) {
            debug(`skipping ${id} (entry is not js)`);
            return false;
        }
        if (!fs_extra_1.default.existsSync(entryFilePath)) {
            debug(`skipping ${id} (entry file does not exist)`);
            console.error(chalk_1.default.yellow(`[vite] dependency ${id} declares non-existent entry file ${entryFilePath}.`));
            return false;
        }
        const content = fs_extra_1.default.readFileSync(entryFilePath, 'utf-8');
        const [imports, exports] = es_module_lexer_1.parse(content);
        if (!exports.length && !/export\s+\*\s+from/.test(content)) {
            debug(`optimizing ${id} (no exports, likely commonjs)`);
            return true;
        }
        for (const { s, e } of imports) {
            let i = content.slice(s, e).trim();
            i = resolver.alias(i) || i;
            if (i.startsWith('.')) {
                debug(`optimizing ${id} (contains relative imports)`);
                return true;
            }
            if (!deps.includes(i)) {
                debug(`optimizing ${id} (imports sub dependencies)`);
                return true;
            }
        }
        debug(`skipping ${id} (single esm file, doesn't need optimization)`);
    });
    const qualified = {};
    qualifiedDeps.forEach((id) => {
        qualified[id] = resolver_1.resolveNodeModule(root, id, resolver).entryFilePath;
    });
    // mark non-optimized deps as external
    const external = deps
        .filter((id) => !qualifiedDeps.includes(id))
        // make sure aliased deps are external
        // https://github.com/vitejs/vite-plugin-react/issues/4
        .map((id) => resolver.alias(id) || id);
    return {
        qualified,
        external
    };
}
```

- 首先去根目录的`package.json`中找其`dependencies`

```js
const deps = Object.keys(pkg.dependencies || {});
```

- 遍历获取每个依赖的信息`pkgInfo`

```js
const pkgInfo = resolver_1.resolveNodeModule(root, id, resolver);
```

- 使用 es-module-lexer 去获取每个依赖的相关依赖 

```js
const qualifiedDeps = deps.filter((id) => {
  const { entryFilePath } = pkgInfo;
    // ...
    const [imports, exports] = es_module_lexer_1.parse(content);
    // ...
    for (const { s, e } of imports) {
        let i = content.slice(s, e).trim();
        i = resolver.alias(i) || i;
        if (i.startsWith('.')) {
            debug(`optimizing ${id} (contains relative imports)`);
            return true;
        }
        if (!deps.includes(i)) {
            debug(`optimizing ${id} (imports sub dependencies)`);
            return true;
        }
    }
})

```

- 返回所有的依赖的路径

```js
const qualified = {};
qualifiedDeps.forEach((id) => {
    qualified[id] = resolver_1.resolveNodeModule(root, id, resolver).entryFilePath;
});
return {
    qualified,
    external
};
```

比如:

```js
{
  qualified: {vue:'/mnt/c/Users/zpo/learning-vue3x/node_modules/vue/dist/vue.runtime.esm-bundler.js'}
}
```

最后，使用 rollup 对收集的依赖进行打包并输出到 `node_modules/.vite_opt_cache`

```js
try {
    const cacheDir = resolveOptimizedCacheDir(root, pkgPath);

    const rollup = require('rollup');
    const bundle = await rollup.rollup({
        input: qualified,
        external,
        // treeshake: { moduleSideEffects: 'no-external' },
        onwarn: build_1.onRollupWarning(spinner, options),
        ...rollupInputOptions,
        plugins: [
            pluginAssets_1.createDepAssetExternalPlugin(resolver),
            entryAnalysisPlugin_1.entryAnalysisPlugin(),
            ...(await build_1.createBaseRollupPlugins(root, resolver, config)),
            pluginAssets_1.createDepAssetPlugin(resolver, root),
            ...pluginsOptimizer
        ]
    });
    const { output } = await bundle.generate({
        ...config.rollupOutputOptions,
        format: 'es',
        exports: 'named',
        entryFileNames: '[name].js',
        chunkFileNames: 'common/[name]-[hash].js'
    });
    spinner && spinner.stop();
    for (const chunk of output) {
        if (chunk.type === 'chunk') {
            const fileName = chunk.fileName;
            const filePath = path_1.default.join(cacheDir, fileName);
            await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
            await fs_extra_1.default.writeFile(filePath, chunk.code);
        }
        if (chunk.type === 'asset' && chunk.fileName === '_analysis.json') {
            const filePath = path_1.default.join(cacheDir, chunk.fileName);
            await fs_extra_1.default.writeFile(filePath, chunk.source);
        }
    }
    await fs_extra_1.default.writeFile(hashPath, depHash);
}
```