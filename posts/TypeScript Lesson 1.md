---
title: 'TypeScript Lesson 1'
date: '2021--2-04'
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

