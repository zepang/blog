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

# vuePlugin 处理 App.vue 请求的过程

1. 前端加载 `App.vue` 资源 -> 第一次加载

```js
import App from 'App.vue'
```

2. vite 服务过滤出 `.vue` 文件的请求

```js
if (!ctx.path.endsWith('.vue') && !ctx.vue) {
  return next()
}

// 处理 App.vue 文件逻辑
```

3. parseSFC处理`App.vue`文件 -> descriptor

```js
const descriptor = await parseSFC(root, filePath, ctx.body);

// parseSFC主要逻辑：

// 1. 读取`App.vue`文件

// 2. 获取`@vue/compiler-sfc`

// 3. 调用`@vue/compiler-sfc`的`parse`方法 -> descriptor

// 4. const descriptor = {
//       filename,
//       source,
//       template: null,
//       script: null,
//       scriptSetup: null,
//       styles: [],
//       customBlocks: [],
//       cssVars: []
//   };
``` 

比较好奇`@vue/compiler-sfc`做了什么，大概喵了一下：

- 调用 `@vue/compiler-dom（其实内部调用的是@vue/compiler-core）` 的 `parse` 生成 `ast` 对象，大概是下边的结构：

```js
// @vue/compiler-core 的  createRoot 函数
function createRoot(children, loc = locStub) {
    return {
        type: 0 /* ROOT */,
        children,
        helpers: [],
        components: [],
        directives: [],
        hoists: [],
        imports: [],
        cached: 0,
        temps: 0,
        codegenNode: undefined,
        loc
    };
}
```

- 根据`ast`生成 descriptor.template, descriptor.script, descriptor.scriptSetup, descriptor.styles，descriptor.customBlocks，包含如下属性：

```typescript
interface block = {
  attrs,
  content,
  type,
  loc 
}
```

具体的代码：

```js
ast.children.forEach(node => {
    if (node.type !== 1 /* ELEMENT */) {
        return;
    }
    if (!node.children.length && !hasSrc(node)) {
        return;
    }
    switch (node.tag) {
        case 'template':
            if (!descriptor.template) {
                const templateBlock = (descriptor.template = createBlock(node, source, false));
                templateBlock.ast = node;
            }
            else {
                errors.push(createDuplicateBlockError(node));
            }
            break;
        case 'script':
            const scriptBlock = createBlock(node, source, pad);
            const isSetup = !!scriptBlock.attrs.setup;
            if (isSetup && !descriptor.scriptSetup) {
                descriptor.scriptSetup = scriptBlock;
                break;
            }
            if (!isSetup && !descriptor.script) {
                descriptor.script = scriptBlock;
                break;
            }
            errors.push(createDuplicateBlockError(node, isSetup));
            break;
        case 'style':
            const styleBlock = createBlock(node, source, pad);
            if (styleBlock.attrs.vars) {
                errors.push(new SyntaxError(`<style vars> has been replaced by a new proposal: ` +
                    `https://github.com/vuejs/rfcs/pull/231`));
            }
            descriptor.styles.push(styleBlock);
            break;
        default:
            descriptor.customBlocks.push(createBlock(node, source, pad));
            break;
    }
});
```

- 为 descriptor.template, descriptor.script, descriptor.scriptSetup, descriptor.styles，descriptor.customBlocks 生成sourcemap

- 获取 css 变量 -> descriptor.cssVars

4. 第一次加载的`url`不带`query.type`, 经过 `compileSFCMain` 处理之后直接就返回了结果

```js
if (!query.type) {
    // watch potentially out of root vue file since we do a custom read here
    utils_1.watchFileIfOutOfRoot(watcher, root, filePath);
    if (descriptor.script && descriptor.script.src) {
        filePath = await resolveSrcImport(root, descriptor.script, ctx, resolver);
    }
    ctx.type = 'js';
    const { code, map } = await compileSFCMain(descriptor, filePath, publicPath, root);
    ctx.body = code;
    ctx.map = map;
    return etagCacheCheck(ctx);
}
```

`compileSFCMain` 会根据上边 descriptor.template, descriptor.script, descriptor.scriptSetup, descriptor.styles，descriptor.customBlocks 代码块做不同处理:

```js
async function compileSFCMain(descriptor, filePath, publicPath, root) {
    let cached = exports.vueCache.get(filePath);
    if (cached && cached.script) {
        return cached.script;
    }
    const id = hash_sum_1.default(publicPath);
    let code = ``;
    let content = ``;
    let map;
    let script = descriptor.script;
    const compiler = resolveVue_1.resolveCompiler(root);

    // descriptor.script代码块

    if ((descriptor.script || descriptor.scriptSetup) && compiler.compileScript) {
        try {
            script = compiler.compileScript(descriptor, {
                id
            });
        }
        catch (e) {
            console.error(chalk_1.default.red(`\n[vite] SFC <script setup> compilation error:\n${chalk_1.default.dim(chalk_1.default.white(filePath))}`));
            console.error(chalk_1.default.yellow(e.message));
        }
    }
    if (script) {
        content = script.content;
        map = script.map;
        if (script.lang === 'ts') {
            const res = await esbuildService_1.transform(content, publicPath, {
                loader: 'ts'
            });
            content = res.code;
            map = serverPluginSourceMap_1.mergeSourceMap(map, JSON.parse(res.map));
        }
    }
    code += compiler_sfc_1.rewriteDefault(content, '__script');
    let hasScoped = false;
    let hasCSSModules = false;

    // descriptor.styles代码块

    if (descriptor.styles) {
        descriptor.styles.forEach((s, i) => {
            const styleRequest = publicPath + `?type=style&index=${i}`;
            if (s.scoped)
                hasScoped = true;
            if (s.module) {
                if (!hasCSSModules) {
                    code += `\nconst __cssModules = __script.__cssModules = {}`;
                    hasCSSModules = true;
                }
                const styleVar = `__style${i}`;
                const moduleName = typeof s.module === 'string' ? s.module : '$style';
                code += `\nimport ${styleVar} from ${JSON.stringify(styleRequest + '&module')}`;
                code += `\n__cssModules[${JSON.stringify(moduleName)}] = ${styleVar}`;
            }
            else {
                code += `\nimport ${JSON.stringify(styleRequest)}`;
            }
        });
        if (hasScoped) {
            code += `\n__script.__scopeId = "data-v-${id}"`;
        }
    }

    // descriptor.customBlocks代码块

    if (descriptor.customBlocks) {
        descriptor.customBlocks.forEach((c, i) => {
            const attrsQuery = attrsToQuery(c.attrs, c.lang);
            const blockTypeQuery = `&blockType=${querystring_1.default.escape(c.type)}`;
            let customRequest = publicPath + `?type=custom&index=${i}${blockTypeQuery}${attrsQuery}`;
            const customVar = `block${i}`;
            code += `\nimport ${customVar} from ${JSON.stringify(customRequest)}\n`;
            code += `if (typeof ${customVar} === 'function') ${customVar}(__script)\n`;
        });
    }

    // descriptor.template代码块

    if (descriptor.template) {
        const templateRequest = publicPath + `?type=template`;
        code += `\nimport { render as __render } from ${JSON.stringify(templateRequest)}`;
        code += `\n__script.render = __render`;
    }
    code += `\n__script.__hmrId = ${JSON.stringify(publicPath)}`;
    code += `\ntypeof __VUE_HMR_RUNTIME__ !== 'undefined' && __VUE_HMR_RUNTIME__.createRecord(__script.__hmrId, __script)`;
    code += `\n__script.__file = ${JSON.stringify(filePath)}`;
    code += `\nexport default __script`;
    const result = {
        code,
        map,
        bindings: script ? script.bindings : undefined
    };
    cached = cached || { styles: [], customs: [] };
    cached.script = result;
    exports.vueCache.set(filePath, cached);
    return result;
}
```

来看下对于`descriptor.script`(`<script>`)代码块的处理:

```js
 // descriptor.script代码块
    
if ((descriptor.script || descriptor.scriptSetup) && compiler.compileScript) {
    try {
        // @vue/complier-sfc 的 compileScript 函数
        script = compiler.compileScript(descriptor, {
            id
        });
    }
    catch (e) {
        console.error(chalk_1.default.red(`\n[vite] SFC <script setup> compilation error:\n${chalk_1.default.dim(chalk_1.default.white(filePath))}`));
        console.error(chalk_1.default.yellow(e.message));
    }
}

if (script) {
    content = script.content;
    map = script.map;
    if (script.lang === 'ts') {
        // 若是ts还需要调用 esbuild 进行处理
        const res = await esbuildService_1.transform(content, publicPath, {
            loader: 'ts'
        });
        content = res.code;
        map = serverPluginSourceMap_1.mergeSourceMap(map, JSON.parse(res.map));
    }
}
```

`@vue/compiler-sfc` 的 `compileScript`会调用`@babel/parser`去处理`<script>`的代码，此外，还可以留意下 `analyzeBindingsFromOptions` 函数

由于`compileScript`函数代码过多，这里仅粘贴部分代码：

```js
var parser = require('@babel/parser');

function compileScript(sfc, options) { 
  // ...
  if (!scriptSetup) {
        if (!script) {
            throw new Error(`[@vue/compiler-sfc] SFC contains no <script> tags.`);
        }
        if (scriptLang && scriptLang !== 'ts') {
            // do not process non js/ts script blocks
            return script;
        }
        try {
            const scriptAst = parser.parse(script.content, {
                plugins,
                sourceType: 'module'
            }).program.body;
            const bindings = analyzeScriptBindings(scriptAst);
            const needRewrite = cssVars.length || hasInheritAttrsFlag;
            let content = script.content;
            if (needRewrite) {
                content = rewriteDefault(content, `__default__`, plugins);
                if (cssVars.length) {
                    content += genNormalScriptCssVarsCode(cssVars, bindings, scopeId, !!options.isProd);
                }
                if (hasInheritAttrsFlag) {
                    content += `__default__.inheritAttrs = false`;
                }
                content += `\nexport default __default__`;
            }
            return {
                ...script,
                content,
                bindings,
                scriptAst
            };
        }
        catch (e) {
            // silently fallback if parse fails since user may be using custom
            // babel syntax
            return script;
        }
    }
  // ...
}

function analyzeScriptBindings(ast) {
    for (const node of ast) {
        if (node.type === 'ExportDefaultDeclaration' &&
            node.declaration.type === 'ObjectExpression') {
            return analyzeBindingsFromOptions(node.declaration);
        }
    }
    return {};
}

function analyzeBindingsFromOptions(node) {
    const bindings = {};
    for (const property of node.properties) {
        if (property.type === 'ObjectProperty' &&
            !property.computed &&
            property.key.type === 'Identifier') {
            // props
            if (property.key.name === 'props') {
                // props: ['foo']
                // props: { foo: ... }
                for (const key of getObjectOrArrayExpressionKeys(property.value)) {
                    bindings[key] = "props" /* PROPS */;
                }
            }
            // inject
            else if (property.key.name === 'inject') {
                // inject: ['foo']
                // inject: { foo: {} }
                for (const key of getObjectOrArrayExpressionKeys(property.value)) {
                    bindings[key] = "options" /* OPTIONS */;
                }
            }
            // computed & methods
            else if (property.value.type === 'ObjectExpression' &&
                (property.key.name === 'computed' || property.key.name === 'methods')) {
                // methods: { foo() {} }
                // computed: { foo() {} }
                for (const key of getObjectExpressionKeys(property.value)) {
                    bindings[key] = "options" /* OPTIONS */;
                }
            }
        }
        // setup & data
        else if (property.type === 'ObjectMethod' &&
            property.key.type === 'Identifier' &&
            (property.key.name === 'setup' || property.key.name === 'data')) {
            for (const bodyItem of property.body.body) {
                // setup() {
                //   return {
                //     foo: null
                //   }
                // }
                if (bodyItem.type === 'ReturnStatement' &&
                    bodyItem.argument &&
                    bodyItem.argument.type === 'ObjectExpression') {
                    for (const key of getObjectExpressionKeys(bodyItem.argument)) {
                        bindings[key] =
                            property.key.name === 'setup'
                                ? "setup-maybe-ref" /* SETUP_MAYBE_REF */
                                : "data" /* DATA */;
                    }
                }
            }
        }
    }
    return bindings;
}
```


经过一系列的拼接之后，返回给客户端，需要注意的是这一阶段返回的内容还会经过`moduleRewritePlugin`的处理

最终返回如下内容：

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

5. 通过上边的 `compileSFCMain` 函数和`App.vue`第一次请求返回的内容可以发现，`<style>` `<template>` 块的具体处理并没有在该函数内处理，而是通过`import`导入`App.vue?type=${type}`再次发起了请求

首先来看下`type=style`的处理：

```js
async function compileSFCStyle(root, style, index, filePath, publicPath, { cssPreprocessOptions, cssModuleOptions }) {
    let cached = exports.vueCache.get(filePath);
    const cachedEntry = cached && cached.styles && cached.styles[index];
    if (cachedEntry) {
        debug(`${publicPath} style cache hit`);
        return cachedEntry;
    }
    const start = Date.now();
    const { generateCodeFrame } = resolveVue_1.resolveCompiler(root);
    const resource = filePath + `?type=style&index=${index}`;
    const result = (await cssUtils_1.compileCss(root, publicPath, {
        source: style.content,
        filename: resource,
        id: ``,
        scoped: style.scoped != null,
        modules: style.module != null,
        // @ts-ignore TODO @deprecated
        vars: style.vars != null,
        preprocessLang: style.lang,
        preprocessOptions: cssPreprocessOptions,
        modulesOptions: cssModuleOptions
    }));
    cssUtils_1.recordCssImportChain(result.dependencies, resource);
    // ...
    result.code = await cssUtils_1.rewriteCssUrls(result.code, publicPath);
    cached = cached || { styles: [], customs: [] };
    cached.styles[index] = result;
    exports.vueCache.set(filePath, cached);
    debug(`${publicPath} style compiled in ${Date.now() - start}ms`);
    return result;
}
```

