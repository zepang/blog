---
title: '为什么需要Typescript？'
date: '2021-2-04'
---

# toc

# 环境准备

* VS Code

# 为什么需要 TypeScript？

我们先来看下下边的例子：

```js
// 假设有一个书籍仓库
const bookStorage = {
    // 仓库允许存书的数量
    limit: undefined,
    // 仓库书籍
    books: []
}

// 当前库存的书籍数量
const storageBookAmount = ''

// 初始化 仓库的存水容量为 5000，且不允许修改
Object.defineProperty(bookStorage, 'limit', { readonly: true, val: 5000 })

// 创建一个获取仓库已使用的容量，或者说当前仓库的书籍数量函数
function storageUsed () {
    if (storageBookAmount) {
        return storageBookAmount
    } 

    storageBookAmount = bookStorage.length

    return storageBookAmount
}

// 创建一个添加书籍的函数
function add(books) {
    if (bookStorage.max - books.lenth >= storageUsed) {
        for (let book of books) {
            bookStorage.books.add(book)
            
            storageBookAmount += 1;

            console.log(`The book ${boo.nmae} has been stored`)
        }
    }
}

add({ name: `Book's Title` })

console.log(bookStorage)
```

运行上边的代码，并查看输出的结果，我们发现书籍并没有如期添加到仓库中，程序也没有跑出错误。

也许对于有经验的你一眼就瞄出了程序中的几处错误，那么你一眼瞄出了几处呢？

对于那些瞄不出的错误，我们下一步的大概操作就是通过断点来调试程序代码

在断点调试之前，我们来尝试一下其它的方式来找出程序中的错误

# 在 VS Code 上使用 TypeScript 校验 js 文件

1. 勾选 VS Code > setting > javasciprt > validate

2. 在上述代码文件头部添加 `//@ts-check`

OK，不出意外我们能看到，编辑器给某些代码标记了一些红色的波浪线标记

![](/images/why-typescript.png)

把鼠标移动并悬停在波浪线标记的代码上方，VS Code会弹出提示告知我们一些信息，比如：

![](/images/why-typescript-hover-1.png)

VS Code告诉我们，readonly 属性不存在于 ProperDescriptor 类型中，所以，我们无法指定该属性值。正确的一个属性名应该是`writable`。

我们也可以通过一些快捷键调出VS Code提供的输入建议（快捷键位组合可能与系统相关，请查看 VS Code -> setting -> keyboard shortcuts -> trigger suggest 绑定的快捷键）

![](/images/why-typescript-suggest.png)

好的，我们现在把 `readonly` 换成 `writable`，发现 `val` 出现了同样的提示，同样把 `val` 改成 `value`，直到VS Code不给出提示

接着往下看其他的代码提示：

![](/images/why-typescript-hover-2.png)
![](/images/why-typescript-hover-3.png)
![](/images/why-typescript-hover-4.png)
![](/images/why-typescript-hover-5.png)

最终代码修改如下：

```js
// @ts-check
// 假设有一个书籍仓库
const bookStorage = {
    // 仓库允许存书的数量
    limit: undefined,
    // 仓库书籍
    books: []
}

// 当前库存的书籍数量
let storageBookAmount = ''

// 初始化 仓库的存水容量为 5000，且不允许修改
Object.defineProperty(bookStorage, 'limit', { writable: true, value: 5000 })

// 创建一个获取仓库已使用的容量，或者说当前仓库的书籍数量函数
function storageUsed () {
    if (storageBookAmount) {
        return storageBookAmount
    } 

    storageBookAmount = bookStorage.length

    return storageBookAmount
}

// 创建一个添加书籍的函数
function add(books) {
    if (Number(bookStorage.max - books.lenth) >= Number(storageUsed)) {
        for (let book of books) {
            bookStorage.books.push(book)
            
            storageBookAmount += 1;

            console.log(`The book ${book.nmae} has been stored`)
        }
    }
}

add({ name: `Book's Title` })

console.log(bookStorage)
```

再次运行程序，依然不是期望的结果。

显然，程序中存在着那么VS Code未给出提示的其它的问题，但是，先不着急查看代码，我们希望VS Code 或者说 typescript 能够给出提示告诉我们，哪些代码是有问题的。

# 类型和类型推断

什么是类型？

你可以简单的认为就是一种约束。关于更加深入的内容，因为其它语言比如C/C++, Java, C#等对它的解释已经够多了，所以这里就不多啰嗦了。

什么是类型推断？

我们取上边案例的一段代码，并做改动如下：

```js
function storageUsed () {
    if (storageBookAmount) {
        return storageBookAmount
    } 

    // 原
    // storageBookAmount = bookStorage.length

    // 改
    storageBookAmount = 0

    return storageBookAmount
}
```

然后，typescript 通过 VS Code 提示我们 type number 不允许指定给 type string：

![](/images/why-typescript-hover-6.png)

显然，变量的赋值受到了类型的约束，但是，Typescript 是如何在没有明显的给出变量类型的情况下确定 `storageBookAmount`的类型的呢？

Typescript 使用了一个概念叫 **类型推断**。Typescript 会在初始化变量进行赋值的时候，推断该变量的类型为值类型。

比如，上边的`storageBookAmount`声明，初始化赋值的时候已经被推断类型为 `string`：

```js
let storageBookAmount = ''
```

通过把鼠标悬停至变量上方，可以看到 Typescript 给出的类型推断，如下图

![](/images/why-typescript-hover-7.png)

# 使用 JSDoc 来声明类型

继续回到上边的案例，在修改完代码（第一次修改）之后，发现代码依然存在某些问题，为了让编辑器能够提示我们哪些带有问题，这里添加 JSDoc 注释来辅助 Typescript。

我们为修改后的代码加上 JSDoc 注释，发现新增好了好多的提示，如下图：

![](/images/why-typescript-error-1.png)

依据给出的提示，得到第二次修复后的代码，如下：

```js
// @ts-check

/**
 * @typedef {Object} Book
 * @property {String} name 
 */

/**
 * @typedef {Object} BookStorage
 * @property {Number} limit 
 * @property {Book[]} books 
 */

// 假设有一个书籍仓库
/** @type BookStorage */
const bookStorage = {
    // 仓库允许存书的数量
    limit: undefined,
    // 仓库书籍
    books: []
}

// 当前库存的书籍数量
let storageBookAmount = 0

// 初始化 仓库的存水容量为 5000，且不允许修改
Object.defineProperty(bookStorage, 'limit', { writable: true, value: 5000 })

/**
 * @returns {Number}
 */
// 创建一个获取仓库已使用的容量，或者说当前仓库的书籍数量函数
function storageUsed () {
    if (storageBookAmount) {
        return storageBookAmount
    } 

    storageBookAmount = bookStorage.books.length

    return storageBookAmount
}

// 创建一个添加书籍的函数
 /**
  * 
  * @param {Book[]} books 
  */
function add(books) {
    if (Number(bookStorage.limit - books.length) >= Number(storageUsed)) {
        for (let book of books) {
            bookStorage.books.push(book)
            
            storageBookAmount += 1;

            console.log(`The book ${book.name} has been stored`)
        }
    }
}

add([{ name: `Book's Title` }])

console.log(bookStorage)
```

需要注意的是，到这一步，我们的代码依旧不能正确返回期望的结果。

因为，我们在第一次修改的时候，为了消除下边这个错误提示，使用的强制类型转换

![](/images/why-typescript-hover-3.png)

```js
function add(books) {
    if (Number(bookStorage.limit - books.length) >= Number(storageUsed)) {
        for (let book of books) {
            bookStorage.books.push(book)
            
            storageBookAmount += 1;

            console.log(`The book ${book.name} has been stored`)
        }
    }
}
```

所以，影响了 Typescript 的检查，当我们去掉强制转换类型的代码之后，就可以看到 Typescript 给出的提示：

![](/images/why-typescript-error-2.png)

最终的修改代码如下：

```js
// @ts-check

/**
 * @typedef {Object} Book
 * @property {String} name 
 */

/**
 * @typedef {Object} BookStorage
 * @property {Number} limit 
 * @property {Book[]} books 
 */

// 假设有一个书籍仓库
/** @type BookStorage */
const bookStorage = {
    // 仓库允许存书的数量
    limit: undefined,
    // 仓库书籍
    books: []
}

// 当前库存的书籍数量
let storageBookAmount = 0

// 初始化 仓库的存水容量为 5000，且不允许修改
Object.defineProperty(bookStorage, 'limit', { writable: true, value: 5000 })

/**
 * @returns {Number}
 */
// 创建一个获取仓库已使用的容量，或者说当前仓库的书籍数量函数
function storageUsed () {
    if (storageBookAmount) {
        return storageBookAmount
    } 

    storageBookAmount = bookStorage.books.length

    return storageBookAmount
}

// 创建一个添加书籍的函数
 /**
  * 
  * @param {Book[]} books 
  */
function add(books) {
    if (bookStorage.limit - books.length >= storageUsed()) {
        for (let book of books) {
            bookStorage.books.push(book)
            
            storageBookAmount += 1;

            console.log(`The book ${book.name} has been stored`)
        }
    }
}

add([{ name: `Book's Title` }])

console.log(bookStorage)
```

![](/images/why-typescript-result.png)

Good boy！

# 总结

通过文章的案例，为主题“为什么需要Typescript？”提供了一个理由，Typescript 能够帮助开发者减少错误代码。

因为，本章为了减少阅读的困难，并没有直接使用 typescript 的语法，而是使用了 JSDoc 注释。

`@ts-check` 和 JSDoc 注释算是一种缓慢向 typescript 笔记好过渡的方式，但是，和 Typescript 比起来还是有很多不足，比如，JSDoc 定义的类型无法共享。

所以，下一章，我们将开始直接使用 Typescript 编写代码，也许你能更多使用 Typescript 的理由。