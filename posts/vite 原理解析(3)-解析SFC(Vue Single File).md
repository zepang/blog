---
title: vite 原理解析(3)-解析SFC(Vue Single File)
date: '2020-09-18'
---

# toc

# 环境准备

- VS Code

- Node.js

- Yarn

# 多次加载.vue文件

从上一章节：[vite 原理解析(2)-重写npm模块(moduleRewritePlugin)和@modules] 中，发现 `main.js` 是直接加载`App.vue`文件：

![](/images/vite-es-modules-main.jpg)

通过`import`关键字导入的静态资源，都会以请求的方式进行加载，那么，可以通过`chrome`的控制台来看下其具体的内容。

打开`chrome -> network`可以看到过滤出来的`App.vue`的资源有三个：

![](/images/vit-vueplugin-vue-3.jpg)

其中`App.vue`是通过`main.js`加载的，其内容为：

```js
import HelloWorld from '/src/components/HelloWorld.vue'

const __script = {
    name: 'App',
    components: {
        HelloWorld
    }
}

import "/src/App.vue?type=style&index=0"
import "/src/App.vue?type=style&index=1"
import {render as __render} from "/src/App.vue?type=template"
__script.render = __render
__script.__hmrId = "/src/App.vue"
typeof __VUE_HMR_RUNTIME__ !== 'undefined' && __VUE_HMR_RUNTIME__.createRecord(__script.__hmrId, __script)
__script.__file = "/mnt/c/Users/zpo/learning-vue3x/src/App.vue"
export default __script
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9tbnQvYy9Vc2Vycy96cG8vbGVhcm5pbmctdnVlM3gvc3JjL0FwcC52dWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU9BLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNWLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ1g7QUFDRiIsImZpbGUiOiIvbW50L2MvVXNlcnMvenBvL2xlYXJuaW5nLXZ1ZTN4L3NyYy9BcHAudnVlIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPCEtLSA8aW1nIGFsdD1cIlZ1ZSBsb2dvXCIgc3JjPVwiLi9hc3NldHMvbG9nby5wbmdcIiAvPlxuICA8SGVsbG9Xb3JsZCBtc2c9XCJIZWxsbyBWdWUgMy4wICsgVml0ZVwiIC8+IC0tPlxuICA8ZGl2PjwvZGl2PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCBIZWxsb1dvcmxkIGZyb20gJy4vY29tcG9uZW50cy9IZWxsb1dvcmxkLnZ1ZSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnQXBwJyxcbiAgY29tcG9uZW50czoge1xuICAgIEhlbGxvV29ybGRcbiAgfVxufVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbmh0bWwsIGJvZHkge1xuICBtYXJnaW46IDA7XG59XG48L3N0eWxlPlxuXG48c3R5bGU+XG5odG1sLCBib2R5IHtcbiAgcGFkZGluZzogMDtcbn1cbjwvc3R5bGU+XG4iXX0=
```

另外两个`App.vue?type=template`和`App.vue?type=style&index=0`是通过`App.vue`资源进行加载的，其内容分别为：

```js
import {createCommentVNode as _createCommentVNode, createVNode as _createVNode, Fragment as _Fragment, openBlock as _openBlock, createBlock as _createBlock} from "/@modules/vue.js"

const _hoisted_1 = /*#__PURE__*/
_createVNode("div", null, null, -1 /* HOISTED */
)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (_openBlock(),
    _createBlock(_Fragment, null, [_createCommentVNode(" <img alt=\"Vue logo\" src=\"./assets/logo.png\" />\n  <HelloWorld msg=\"Hello Vue 3.0 + Vite\" /> "), _hoisted_1], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    ))
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9tbnQvYy9Vc2Vycy96cG8vbGVhcm5pbmctdnVlM3gvc3JjL0FwcC52dWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Z0NBR0UsYUFBVzs7OztJQUZYLDBIQUM2QztJQUM3QyxVQUFXIiwiZmlsZSI6Ii9tbnQvYy9Vc2Vycy96cG8vbGVhcm5pbmctdnVlM3gvc3JjL0FwcC52dWUiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiPHRlbXBsYXRlPlxuICA8IS0tIDxpbWcgYWx0PVwiVnVlIGxvZ29cIiBzcmM9XCIuL2Fzc2V0cy9sb2dvLnBuZ1wiIC8+XG4gIDxIZWxsb1dvcmxkIG1zZz1cIkhlbGxvIFZ1ZSAzLjAgKyBWaXRlXCIgLz4gLS0+XG4gIDxkaXY+PC9kaXY+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IEhlbGxvV29ybGQgZnJvbSAnLi9jb21wb25lbnRzL0hlbGxvV29ybGQudnVlJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdBcHAnLFxuICBjb21wb25lbnRzOiB7XG4gICAgSGVsbG9Xb3JsZFxuICB9XG59XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuaHRtbCwgYm9keSB7XG4gIG1hcmdpbjogMDtcbn1cbjwvc3R5bGU+XG5cbjxzdHlsZT5cbmh0bWwsIGJvZHkge1xuICBwYWRkaW5nOiAwO1xufVxuPC9zdHlsZT5cbiJdfQ==
```

```js
import { updateStyle } from "/vite/client"
const css = "\nhtml, body {\n  margin: 0;\n}\n"
updateStyle("7ac74a55-0", css)
export default css
```

# vuePlugin

接下来分析一下`vite`处理`.vue`文件和返回上述文件内容的插件源码--`vuePlugin`。

以下是其完整的代码：

```js
export const vuePlugin: ServerPlugin = ({
  root,
  app,
  resolver,
  watcher,
  config
}) => {
  const etagCacheCheck = (ctx: Context) => {
    ctx.etag = getEtag(ctx.body)
    ctx.status =
      seenUrls.has(ctx.url) && ctx.etag === ctx.get('If-None-Match') ? 304 : 200
    seenUrls.add(ctx.url)
  }

  app.use(async (ctx, next) => {
    // ctx.vue is set by other tools like vitepress so that vite knows to treat
    // non .vue files as vue files.
    if (!ctx.path.endsWith('.vue') && !ctx.vue) {
      return next()
    }

    const query = ctx.query
    const publicPath = ctx.path
    let filePath = resolver.requestToFile(publicPath)

    // upstream plugins could've already read the file
    const descriptor = await parseSFC(root, filePath, ctx.body)
    if (!descriptor) {
      return next()
    }
    // 第一次请求 xxx.vue 文件不带 query.type
    if (!query.type) {
      // watch potentially out of root vue file since we do a custom read here
      watchFileIfOutOfRoot(watcher, root, filePath)

      if (descriptor.script && descriptor.script.src) {
        filePath = await resolveSrcImport(
          root,
          descriptor.script,
          ctx,
          resolver
        )
      }
      ctx.type = 'js'
      const { code, map } = await compileSFCMain(
        descriptor,
        filePath,
        publicPath,
        root
      )
      // 写入 import xxx.vue?type = template
      ctx.body = code
      ctx.map = map
      return etagCacheCheck(ctx)
    }
    
    // 上一步返回的结果，将会请求 xxx.vue?type=template
    if (query.type === 'template') {
      const templateBlock = descriptor.template!
      if (templateBlock.src) {
        filePath = await resolveSrcImport(root, templateBlock, ctx, resolver)
      }
      ctx.type = 'js'
      const cached = vueCache.get(filePath)
      const bindingMetadata = cached && cached.script && cached.script.bindings
      const vueSpecifier = resolveBareModuleRequest(
        root,
        'vue',
        publicPath,
        resolver
      )

      // 借助 @vue/compiler-sfc template -> render函数
      const { code, map } = compileSFCTemplate(
        root,
        templateBlock,
        filePath,
        publicPath,
        descriptor.styles.some((s) => s.scoped),
        bindingMetadata,
        vueSpecifier,
        config
      )
      ctx.body = code
      ctx.map = map
      return etagCacheCheck(ctx)
    }

    if (query.type === 'style') {
      const index = Number(query.index)
      const styleBlock = descriptor.styles[index]
      if (styleBlock.src) {
        filePath = await resolveSrcImport(root, styleBlock, ctx, resolver)
      }
      const id = hash_sum(publicPath)
      const result = await compileSFCStyle(
        root,
        styleBlock,
        index,
        filePath,
        publicPath,
        config
      )
      ctx.type = 'js'
      ctx.body = codegenCss(`${id}-${index}`, result.code, result.modules)
      return etagCacheCheck(ctx)
    }

    if (query.type === 'custom') {
      const index = Number(query.index)
      const customBlock = descriptor.customBlocks[index]
      if (customBlock.src) {
        filePath = await resolveSrcImport(root, customBlock, ctx, resolver)
      }
      const result = resolveCustomBlock(
        customBlock,
        index,
        filePath,
        publicPath
      )
      ctx.type = 'js'
      ctx.body = result
      return etagCacheCheck(ctx)
    }
  })

  const handleVueReload = (watcher.handleVueReload = async (
    filePath: string,
    timestamp: number = Date.now(),
    content?: string
  ) => {
    // ...
  })

  watcher.on('change', (file) => {
    if (file.endsWith('.vue')) {
      handleVueReload(file)
    }
  })
}
```

