---
title: 'Vue3x Composition API 异步状态处理'
date: '2020-10-08'
---

# toc

内容如题，这里列举一下个人目前所了解处理方式。

关于异步任务的一般处理，大部分的人都能写出如下的代码：

```js
<template>
  <button @click="getUser">Try Again!!</button>
  <div v-if="loading">loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else id="github-user">
    <h1>name: {{ user.name }} </h1>
  </div>
</template>

<script>
import axios from 'axios'
import { defineComponent, reactive, ref, onMounted } from 'vue'

function useUser () {
  let user = reactive({
    name: ''
  })
  let loading = ref(false)
  let error = ref(null)

  let getUser = async () => {
    try {
      loading.value = true
      let { data } = await axios.get('https://api.github.com/users/zepang')
      user.name = data.login
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return [user, getUser, loading, error]
}

export default defineComponent({
  setup () {
    let [user, getUser, loading, error] = useUser()

    onMounted(getUser)

    return {
      user,
      getUser,
      loading,
      error
    }
  }
})
</script>
```

如上案例所示，一个异步的请求逻辑，需要维护 `user`, `getUser`, `loading`, `error` 这些状态来更新视图。

如果每一个异步的逻辑都需要维护上边这么多的状态，当然，现实中可能需要维护的状态数据可能更多也可能更少，但是，无论是多是少，我们的业务代码中将充斥着很多的重复的代码。

那么，如何减少这些重复的逻辑代码就显得非常重要。

我们，来看下社区中提供的一些比较好的实践：

# vue-use/useAsyncState

官方示例：

```js
import axios from 'axios'
import { useAsyncState } from '@vueuse/core'

const { state, ready } = useAsyncState(
  axios
    .get('https://jsonplaceholder.typicode.com/todos/1')
    .then(t => t.data),
  { id: null },
)
```

然后，我们看下其源码：

```js
import { ref } from 'vue-demi'

/**
 * Reactive async state. Will not block your setup function and will triggers changes once
 * the promise is ready.
 *
 * @see   {@link https://vueuse.js.org/useAsyncState}
 * @param promise         The promise / async function to be resolved
 * @param initialState    The initial state, used until the first evaluation finishes
 * @param delay           Delay (ms)
 * @param catchFn         Error handling callback
 */
export function useAsyncState<T>(
  promise: Promise<T>,
  initialState: T,
  delay = 0,
  catchFn = (e: Error) => {},
) {
  const state = ref(initialState)
  const ready = ref(false)

  function run() {
    promise
      .then((data) => {
        // @ts-ignore
        state.value = data
        ready.value = true
      })
      .catch(catchFn)
  }

  if (!delay)
    run()
  else
    setTimeout(run, delay)

  return { state, ready }
}
```

`useAsyncState` 内部给我们维护了 `{ state, ready }`，可以认为是针对我们第一个案例中的 `useUser` 函数的一个通用性封装。

- 其文档[https://vueuse.js.org/core/useasyncstate/]

# vue-composition-toolkit/useAsyncState

与 `vue-use/useAsyncState` 类似，这里就不过多解释了，具体的话可以看其源码[https://github.com/HcySunYang/vue-composition-toolkit/blob/master/src/useAsyncState.ts](https://github.com/HcySunYang/vue-composition-toolkit/blob/master/src/useAsyncState.ts)

# Suspense 

`Suspense`并不是社区的提供的解决方式，而是官方提供的新的 `内置组件`

```js
<template>
   <Suspense>
    <template #default>
      <GithubUser />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

`Susepense`提供的便利：

- `Suspense` 组件提供了两个插槽 `default` 和 `fallback`，来分别展示数据和loading

- 能够直接使用 `async` 关键字定义 `setup` 函数，需要维护的状态数据将减少 

```js
export default defineComponent({
  async setup () {
    let user = reactive({
      name: ''
    })
    let { data } = await axios.get('https://api.github.com/users/zepang')
    user.name = data.login
    return { user }
  }
})
```

注意点：

- 需要在`GithubUser`组件的父组件中使用 `Suspense`

- error状态仍然需要我们自己维护

社区中当然也提供了类似的库，并且解决上述的两个问题，这个库就是 `vue-promised`

# vue-promised

```js
<template>
  <Promised :promise="usersPromise">
    <template v-slot:pending>
      <p>loading...</p>
    </template>
    <template v-slot="data">
      <h1>name: {{ user.name }} </h1>
    </template>
    <template v-slot:rejected="error">
      <p>Error: {{ error.message }}</p>
    </template>
  </Promised>
</template>
```

- vue-promised的相关文档[https://github.com/posva/vue-promised](https://github.com/posva/vue-promised)

# vue-concurrency — useTask

解决的问题和上述的其他库类似，直接贴一下官方的示例：

```js
<script>
export default defineComponent({
  setup() {
    const task = useTask(function*() {
      yield timeout(1000);
      return "tada";
    });

    task.perform();
    return { task };
  },
});
</script>
<template>
  <div>
    <div v-if="task.isRunning">
      Loading...
    </div>
    <div v-else-if="task.isError">
      Something went wrong
    </div>
    <div v-else>
      {{ task.last.value }}
    </div>
  </div>
</template>
```

另外，该库还包含了其他比较实用的特性

- 支持取消任务

```js
setup() {
  const latestData = ref(null);
  const getLatestTask = useTask(function*() {
    while (true) {
      latestData.value = yield get('/api/news');
      yield timeout(5000); // wait 5s
    }
  }).drop();
  // 👆such a task is fine to do. It will get canceled when the component is unmounted.
  getLatestTask.perform(); // start polling right away

  // if needed, you can pass methods to pause and resume the task to the template
  function pause() {
    getLatestTask.cancelAll();
  }

  function resume() {
    // a plain perform like that is safe because the task is set to `drop()`
    // therefore it won't start a new instance if it's already running
    getLatestTask.perform();
  }

  return { getLatestTask, pause, resume };
}
```

- 支持任务串行，节流，并发限制等等:

```js
const task = useTask(function*() {
  /* ... */
})
  .restartable()
  .maxConcurrency(3);
```

- 支持SSR，Typescript

具体内容请查看相关的文档：[https://github.com/martinmalinda/vue-concurrency](https://github.com/martinmalinda/vue-concurrency)
