---
title: Vue3x组件渲染
date: '2020-11-05'
---
# toc

今天，准备探究一下Vue3x的组件渲染过程。

# 应用初始化

我们简单的创建一个Vue3x的应用：

```
yarn create vite-app leraning-vue3x
```

Vue会从一个根节点开始整个组件树的渲染，打开 `src/main.js`：

```js
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

const app = createApp(App)

app.mount('#app')
```

Vue3x导出一个函数`createApp`来创建应用实例（`app`），这与Vue2x使用 `new` 关键字直接创建实例略微有所差别，不过两者最终都需要通过调用 `app.mount` 挂载到 `DOM` 节点。

接下来，在`createApp(app)`之前打一个断点，然后启动运用，打开`chrome`浏览器和控制台，我们通过断点调试来分析一下该函数和`app`创建过程。

# createApp函数

ok，通过断点直接进入`createApp`内部，可以发现`createApp`大概做了下边两件事情

- 创建 app

- 重写 app.mount 函数，并在内部调用原来的 mount 函数

```js
const createApp = ((...args) => {
    // 1. 创建 app
    const app = ensureRenderer().createApp(...args);
    if ((process.env.NODE_ENV !== 'production')) {
        injectNativeTagCheck(app);
    }
    // 导出 app 的 mount 函数
    const { mount } = app;
    // 2. 重写 mount 函数
    app.mount = (containerOrSelector) => {
        const container = normalizeContainer(containerOrSelector);
        if (!container)
            return;
        const component = app._component;
        if (!isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML;
        }
        // clear content before mounting
        container.innerHTML = '';
        // 调用原 app.mount
        const proxy = mount(container);
        container.removeAttribute('v-cloak');
        container.setAttribute('data-v-app', '');
        return proxy;
    };
    return app;
});
```

接下来，我们逐步分析一下具体的过程。

# 创建app

```js
/**
 * render = { render, hydrate, createApp }
 */
const render = ((...args) => {
    // 我们使用的是vite创建的项目，createApp(App) 传入的App组件不仅是单文件导出的对象已经是经过vite转化过的对象，其内已经包含render函数
    // 具体可以看 @vue/compiler-sfc 这个依赖 vue-loader同样用到了该依赖
    ensureRenderer().render(...args);
});

// 1...
function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions));
}

// 2...
function createRenderer(options) {
    return baseCreateRenderer(options);
}

// 3...
function baseCreateRenderer(options, createHydrationFns) {
    // ...
    const path = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => { ... }
    const processText = (n1, n2, container, anchor) => { ... }
    const processCommentNode = (n1, n2, container, anchor) => { ... }
    // 组件渲染的核心逻辑
    const render = (vnode, container) => { 
       if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode, null, null, true);
            }
        }
        else {
            patch(container._vnode || null, vnode, container);
        }
        flushPostFlushCbs();
        container._vnode = vnode;
    }
    // ...
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    };
}
```

通过追踪代码，发现Vue导出的`createApp`函数内，创建`app`调用的`createApp`函数实际上调用的是`createAppAPI`返回的函数`createApp`。

该函数清晰的描述了 `app` 这个对象的所有属性，下边我贴出了该函数的全部代码，并在重要的地方做了一些注释。

```js
function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            isCustomElement: NO,
            errorHandler: undefined,
            warnHandler: undefined
        },
        // 全局mixins
        mixins: [],
        // 全局插件
        components: {},
        // 全局指令
        directives: {},
        // 全局的provide
        provides: Object.create(null)
    };
}

// ...
function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (rootProps != null && !isObject(rootProps)) {
            (process.env.NODE_ENV !== 'production') && warn(`root props passed to app.mount() must be an object.`);
            rootProps = null;
        }

        /**
         * 1. 创建全局的上下文对象
         * 2. 在调用 app.use app.mixin app.component app.directive ... 等这些方法的时候分别会往全局上下文中存入一些属性
         * 3. 具体的内容可以查看下边的代码和 createAppContext 函数的返回对象
         */ 
        const context = createAppContext();
        const installedPlugins = new Set();
        let isMounted = false;
        const app = (context.app = {
            _uid: uid$1++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            version,
            get config() {
                return context.config;
            },
            set config(v) {
                if ((process.env.NODE_ENV !== 'production')) {
                    warn(`app.config cannot be replaced. Modify individual options instead.`);
                }
            },
            // 全局插件
            use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                    (process.env.NODE_ENV !== 'production') && warn(`Plugin has already been applied to target app.`);
                }
                else if (plugin && isFunction(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                }
                else if (isFunction(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    warn(`A plugin must either be a function or an object with an "install" ` +
                        `function.`);
                }
                return app;
            },
            // 全局mixins
            mixin(mixin) {
                if (__VUE_OPTIONS_API__) {
                    if (!context.mixins.includes(mixin)) {
                        context.mixins.push(mixin);
                        // global mixin with props/emits de-optimizes props/emits
                        // normalization caching.
                        if (mixin.props || mixin.emits) {
                            context.deopt = true;
                        }
                    }
                    else if ((process.env.NODE_ENV !== 'production')) {
                        warn('Mixin has already been applied to target app' +
                            (mixin.name ? `: ${mixin.name}` : ''));
                    }
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    warn('Mixins are only available in builds supporting Options API');
                }
                return app;
            },
            // 全局组件
            component(name, component) {
                if ((process.env.NODE_ENV !== 'production')) {
                    validateComponentName(name, context.config);
                }
                if (!component) {
                    return context.components[name];
                }
                if ((process.env.NODE_ENV !== 'production') && context.components[name]) {
                    warn(`Component "${name}" has already been registered in target app.`);
                }
                context.components[name] = component;
                return app;
            },
            // 全局指令
            directive(name, directive) {
                if ((process.env.NODE_ENV !== 'production')) {
                    validateDirectiveName(name);
                }
                if (!directive) {
                    return context.directives[name];
                }
                if ((process.env.NODE_ENV !== 'production') && context.directives[name]) {
                    warn(`Directive "${name}" has already been registered in target app.`);
                }
                context.directives[name] = directive;
                return app;
            },
            mount(rootContainer, isHydrate) {
                if (!isMounted) {
                    const vnode = createVNode(rootComponent, rootProps);
                    // store app context on the root VNode.
                    // this will be set on the root instance on initial mount.
                    vnode.appContext = context;
                    // HMR root reload
                    if ((process.env.NODE_ENV !== 'production')) {
                        context.reload = () => {
                            render(cloneVNode(vnode), rootContainer);
                        };
                    }
                    if (isHydrate && hydrate) {
                        hydrate(vnode, rootContainer);
                    }
                    else {
                        render(vnode, rootContainer);
                    }
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    if ((process.env.NODE_ENV !== 'production') || __VUE_PROD_DEVTOOLS__) {
                        devtoolsInitApp(app, version);
                    }
                    return vnode.component.proxy;
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    warn(`App has already been mounted.\n` +
                        `If you want to remount the same app, move your app creation logic ` +
                        `into a factory function and create fresh app instances for each ` +
                        `mount - e.g. \`const createMyApp = () => createApp(App)\``);
                }
            },
            unmount() {
                if (isMounted) {
                    render(null, app._container);
                    if ((process.env.NODE_ENV !== 'production') || __VUE_PROD_DEVTOOLS__) {
                        devtoolsUnmountApp(app);
                    }
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    warn(`Cannot unmount an app that is not mounted.`);
                }
            },
            // 全局的provide
            provide(key, value) {
                if ((process.env.NODE_ENV !== 'production') && key in context.provides) {
                    warn(`App already provides property with key "${String(key)}". ` +
                        `It will be overwritten with the new value.`);
                }
                // TypeScript doesn't allow symbols as index type
                // https://github.com/Microsoft/TypeScript/issues/24587
                context.provides[key] = value;
                return app;
            }
        });
        // 返回 app 对象
        return app;
    };
}

```

# 重写 app.mount

```js
function normalizeContainer(container) {
    if (isString(container)) {
        const res = document.querySelector(container);
        if ((process.env.NODE_ENV !== 'production') && !res) {
            warn(`Failed to mount app: mount target selector returned null.`);
        }
        return res;
    }
    return container;
}

const createApp = ((...args) => {
    // ...
    // 导出 app 的 mount 函数
    const { mount } = app;
    // 2. 重写 mount 函数
    app.mount = (containerOrSelector) => {
        // 获取container，
        const container = normalizeContainer(containerOrSelector);
        if (!container)
            return;
        const component = app._component;
        if (!isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML;
        }
        // clear content before mounting
        container.innerHTML = '';
        // 调用原 app.mount
        const proxy = mount(container);
        container.removeAttribute('v-cloak');
        container.setAttribute('data-v-app', '');
        return proxy;
    };
    return app;
});

function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        // ...
        mount(rootContainer, isHydrate) {
            if (!isMounted) {
                // 创建VNode
                const vnode = createVNode(rootComponent, rootProps);
                // store app context on the root VNode.
                // this will be set on the root instance on initial mount.
                vnode.appContext = context;
                // HMR root reload
                if ((process.env.NODE_ENV !== 'production')) {
                    context.reload = () => {
                        render(cloneVNode(vnode), rootContainer);
                    };
                }
                if (isHydrate && hydrate) {
                    hydrate(vnode, rootContainer);
                }
                else {
                    render(vnode, rootContainer);
                }
                isMounted = true;
                app._container = rootContainer;
                rootContainer.__vue_app__ = app;
                if ((process.env.NODE_ENV !== 'production') || __VUE_PROD_DEVTOOLS__) {
                    devtoolsInitApp(app, version);
                }
                return vnode.component.proxy;
            }
            else if ((process.env.NODE_ENV !== 'production')) {
                warn(`App has already been mounted.\n` +
                    `If you want to remount the same app, move your app creation logic ` +
                    `into a factory function and create fresh app instances for each ` +
                    `mount - e.g. \`const createMyApp = () => createApp(App)\``);
            }
        }
    }
}
```

# 创建VNode

```js
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        if ((process.env.NODE_ENV !== 'production') && !type) {
            warn(`Invalid vnode type when creating vnode: ${type}.`);
        }
        type = Comment;
    }
    if (isVNode(type)) {
        // createVNode receiving an existing vnode. This happens in cases like
        // <component :is="vnode"/>
        // #2078 make sure to merge refs during the clone instead of overwriting it
        const cloned = cloneVNode(type, props, true /* mergeRef: true */);
        if (children) {
            normalizeChildren(cloned, children);
        }
        return cloned;
    }
    // class component normalization.
    if (isClassComponent(type)) {
        type = type.__vccOpts;
    }
    // class & style normalization.
    if (props) {
        // for reactive or proxy objects, we need to clone it to enable mutation.
        if (isProxy(props) || InternalObjectKey in props) {
            props = extend({}, props);
        }
        let { class: klass, style } = props;
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass);
        }
        if (isObject(style)) {
            // reactive state objects need to be cloned since they are likely to be
            // mutated
            if (isProxy(style) && !isArray(style)) {
                style = extend({}, style);
            }
            props.style = normalizeStyle(style);
        }
    }
    // encode the vnode type information into a bitmap
    const shapeFlag = isString(type)
        ? 1 /* ELEMENT */
        :  isSuspense(type)
            ? 128 /* SUSPENSE */
            : isTeleport(type)
                ? 64 /* TELEPORT */
                : isObject(type)
                    ? 4 /* STATEFUL_COMPONENT */
                    : isFunction(type)
                        ? 2 /* FUNCTIONAL_COMPONENT */
                        : 0;
    if ((process.env.NODE_ENV !== 'production') && shapeFlag & 4 /* STATEFUL_COMPONENT */ && isProxy(type)) {
        type = toRaw(type);
        warn(`Vue received a Component which was made a reactive object. This can ` +
            `lead to unnecessary performance overhead, and should be avoided by ` +
            `marking the component with \`markRaw\` or using \`shallowRef\` ` +
            `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
    }
    const vnode = {
        __v_isVNode: true,
        ["__v_skip" /* SKIP */]: true,
        type,
        props,
        key: props && normalizeKey(props),
        ref: props && normalizeRef(props),
        scopeId: currentScopeId,
        children: null,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag,
        patchFlag,
        dynamicProps,
        dynamicChildren: null,
        appContext: null
    };
    // validate key
    if ((process.env.NODE_ENV !== 'production') && vnode.key !== vnode.key) {
        warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    normalizeChildren(vnode, children);
    // normalize suspense children
    if ( shapeFlag & 128 /* SUSPENSE */) {
        const { content, fallback } = normalizeSuspenseChildren(vnode);
        vnode.ssContent = content;
        vnode.ssFallback = fallback;
    }
    if (shouldTrack$1 > 0 &&
        // avoid a block node from tracking itself
        !isBlockNode &&
        // has current parent block
        currentBlock &&
        // presence of a patch flag indicates this node needs patching on updates.
        // component nodes also should always be patched, because even if the
        // component doesn't need to update, it needs to persist the instance on to
        // the next vnode so that it can be properly unmounted later.
        (patchFlag > 0 || shapeFlag & 6 /* COMPONENT */) &&
        // the EVENTS flag is only for hydration and if it is the only flag, the
        // vnode should not be considered dynamic due to handler caching.
        patchFlag !== 32 /* HYDRATE_EVENTS */) {
        currentBlock.push(vnode);
    }
    return vnode;
}
```

* VNode的结构

```js
const vnode = {
    __v_isVNode: true,
    ["__v_skip" /* SKIP */]: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    children: null,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
};
```

## SharpeFlags

`https://github.com/vuejs/vue-next/blob/master/packages/shared/src/shapeFlags.ts`:

```js
export const enum ShapeFlags {
  // html 或 svg 标签
  ELEMENT = 1,
  // 函数式组件
  FUNCTIONAL_COMPONENT = 1 << 1,
  // 普通有状态组件
  STATEFUL_COMPONENT = 1 << 2,
  // 子节点是纯文本
  TEXT_CHILDREN = 1 << 3,
  // 子节点是数组
  ARRAY_CHILDREN = 1 << 4,
  // 子节点是 slots
  SLOTS_CHILDREN = 1 << 5,
  // Portal
  PORTAL = 1 << 6,
  // Suspense
  SUSPENSE = 1 << 7,
  // 需要被keepAlive的有状态组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  // 已经被keepAlive的有状态组件
  COMPONENT_KEPT_ALIVE = 1 << 9,
  // 有状态组件和函数式组件都是“组件”，用 COMPONENT 表示
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
```