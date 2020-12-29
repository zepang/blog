---
title: 笔记摘录-你不知道的JavaScript-下篇
img: 'https://placem.at/places?h=140'
date: '2018-03-29'
---

# toc

# 第一部分

## 第一章深入编程

### 实践

掌握开发者工具终端：[http://blog.teamtreehouse.com/mastering-developer-tools-console](http://blog.teamtreehouse.com/mastering-developer-tools-console)

第一章讲一些基本的JavaScript编程语法控制语句等这些内容，比较基础跳过

---

### 第二章深入JavaScript

需要了解的两个术语：

* polyfilling

单词"polyfill"，用于表示根据新特性的定义，创建一段与之等价但能够在旧的JavaScript环境中执行的代码。

ES5-Shim（[https://github.com/es-shims/es5-shim](https://github.com/es-shims/es5-shim)）和 ES6-Shim（[https://github.com/es-shims/es6-shim](https://github.com/es-shims/es6-shim)）

* transpiling

由 transforming 和 compiling 组合而成的术语，因为语言中新增的语法无法通过 pollyfilling 来解决兼容性问题，所以需要工具讲新的语法转换成旧的语法。

* Babel （https://babeljs.io/，从 6 到 5）
从 ES6+ 编译转换到 ES5

* Traceur （https://github.com/google/traceur-compiler）
将 ES6、ES7 及后续版本转换到 ES5

---

# 第二部分 ES6以及更新的版本

## 第一章 ES?现在与未来

### 版本

JavaScript的官方名称是“ECMAScript”，最早的JavaScript版本是ES1和ES2，它们不怎么被人所知，实现也很少。第一个流行起来的JavaScript版本是ES3，它成为浏览器 IE6-8 和早前的旧版 Android 2.x 移动浏览器的JavaScript 标准。出于某些政治原因，倒霉的 ES4 从来没有成形，这里我们不做讨论。

2009 年，ES5 正式发布（然后是 2011 年的 ES5.1），在当代浏览器（包括 Firefox、Chrome、Opera、Safari 以及许多其他类型）的进化和爆发中成为 JavaScript 广泛使用的标准。

下一个 JavaScript 版本（发布日期从 2013 年拖到 2014 年，然后又到 2015 年）标签，之前的共识显然是 ES6。

但是，在 ES6 规范发展后期， 出现了这样的方案：有人建议未来的版本应该改成基于年
份，比如 ES2016（也就是 ES7）来标示在 2016 年结束之前敲定的任何版本的规范。尽管
有异议，但比起后来提出的方案 ES2015，很可能保持统治地位的版本命名仍是 ES6。而
ES2016 可能会采用新的基于年份的命名方案。

## 第二章语法

### 对象字面量拓展

#### 简洁属性

~~~js
// es5 
var o = {
  x: function () {}
}

// es6
let o = {
  x () {

  }
}
~~~
简洁的属性实际上是等价于未命名函数。如果出现下边的情况会报错

~~~js
function runSomething (o) {
  var x = Math.radom()
  var y = Math.radom()

  return o.something(x, y)
}

runSomething({
  something: function something (x, y) {
    if (x > y) {
      return something(y, x)
    }

    return y -x
  }
})
~~~

如果更换成ES6的间接写法：
~~~js
runSomething({
  something (x, y) {
    if (x > y) {
      return something(y, x) // 会报错，找不到 something
    }

    return y -x
  }
})
~~~

有人喜欢用下边的写法：
~~~js
runSomething({
  something (x, y) {
    if (x > y) {
      return this.something(y, x) // 会报错，找不到 something
    }

    return y -x
  }
})
~~~
但是在某些情况下，this会被隐式绑定，比如：
~~~js
button.addEventListener('click', handle, false)
~~~
所以这一点需要注意。

### 设定 prototype

~~~js
var o1.__proto__ = {...}
~~~

现在 ES6 已经有了新的工具函数来设置
~~~js
let o1 = {...}
let o2 = {...}

Object.setPrototypeOf(o1, o2)
~~~
### super 对象

通常把 super 看作和类相关的属性，但是因为JavaScript的类是原型的类，而不是对象的本质，所以 super 对于普通对象的简洁方法一样有效。

~~~js
var o1 = {
  foo() {
    console.log( "o1:foo" );
  }
};
var o2 = {
  foo() {
    super.foo();
    console.log( "o2:foo" );
  }
};
Object.setPrototypeOf( o2, o1 );
o2.foo(); // o1:foo
          // o2:foo
~~~
基本上这里的 super 就是 Object.getPrototypeOf(o2)

super 只允许在简洁方法中出现，而不允许在普通函数表达式属性中出
现。也只允许以 super.XXX 的形式（用于属性 / 方法访问）出现，而不能以
super() 的形式出现。

### 标签模板字面量

~~~js
function foo (string, ...values) {
  console.log(string)
  console.log(values)
}
var desc = 'awesome'
foo`Everything is ${desc}!!`
// ['Everything is', '!!']
// ['awesome']
~~~
第一个参数，名为 strings ，是一个由所有普通字符串（插入表达式之间的部分）组成的
数组。得到的 strings 数组中有两个值： "Everything is" 和 "!!" 。

本质上说，这是一类不需要 ( .. ) 的特殊函数调用。标签（tag）部分，即 `..` 字符串字
面量之前的 foo 这一部分 , 是一个要调用的函数值。实际上，它可以是任意结果为函数的
表达式，甚至可以是一个结果为另一个函数的函数调用，就像下面这样：
~~~js
function bar () {
  return function foo (string, ...values) {
    console.log(string)
    console.log(values)
  }
}
var desc = 'awesome'
bar()`Everything is ${desc}!!`
// ['Everything is', '!!']
// ['awesome']
~~~

~~~js
function tag(strings, ...values) {
  return strings.reduce( function(s,v,idx){
    return s + (idx > 0 ? values[idx-1] : "") + v;
  }, "" );
}
var desc = "awesome";
var text = tag`Everything is ${desc}!`;
console.log( text ); // Everything is awesome!
~~~

下面是一个简单的应用，将数字格式化：
~~~js
function dollabillsyall (strings, ...values) {
  return strings.reduce(function (s,v,idx) {
    if (idx > 0) {
      if (typeof values[idx - 1] === 'number') {
        s += `$${values[idx - 1].toFixed(2)}`
      } else {
        s += values[idx - 1]
      }
    }
    return s + v
  })
}

var amt1 = 11.99,
    amt2 = amt1 * 1.08,
    name = "Kyle";
var text = dollabillsyall
`Thanks for your purchase, ${name}! Your
product cost was ${amt1}, which with tax
comes out to ${amt2}.`
console.log( text );
// Thanks for your purchase, Kyle! Your
// product cost was $11.99, which with tax
// comes out to $12.95.
~~~

#### 原始（raw）字符串

在前面的代码中，标签函数收到一个名为strings的参数，这个参数是一个数组。但是还包括了一些额外的数据：所有字符串的原始未处理版本，可以像下面这样通过 .raw 属性访问这
些原始字符串值：
~~~js
function showraw(strings, ...values) {
  console.log( strings );
  console.log( strings.raw );
}
showraw`Hello\nWorld`;
// [ "Hello
// World" ]
// [ "Hello\nWorld" ]
~~~

### 箭头函数

除了词法 this ，箭头函数还有词法 arguments ——它们没有自己的 arguments 数组，而是继承自父层——词法 super 和 new.target 也是一样（参见 3.4 节）。

### for ... of

ES6 在把 JavaScript 中我们熟悉的 for 和 for..in 循环组合起来的基础上，又新增了一个
for..of 循环，在迭代器产生的一系列值上循环。
for..of 循环的值必须是一个 iterable，或者说它必须是可以转换 / 封箱到一个 iterable 对象
的值（参见本系列《你不知道的 JavaScript（中卷）》第一部分）。iterable 就是一个能够产
生迭代器供循环使用的对象。

这里是 ES6 的但是不用 for..of 的等价代码，也可以用来展示如何手动在迭代器上迭代

~~~js
var a = ["a","b","c","d","e"];
for (var val, ret, it = a[Symbol.iterator]();
(ret = it.next()) && !ret.done;
) {
val = ret.value;
  console.log( val );
}
// "a" "b" "c" "d" "e"
~~~

---

## 代码组织

编写 JavaScript 代码是一回事，而合理组织代码则是另一回事。利用通用模式来组织和复用代码显著提高了代码的可读性和可理解性。简单的来说，就是代码怎么写都能实现的功能，但是通过模式来写的话，可读性会比较好。

ES6 提供了几个重要的特性。

* 迭代器
* 生成器
* 模块
* 类

### 迭代器

#### 迭代器的接口

ES6 第 25.1.1.2 节（https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iterator-interface）详细解释了 Iterator 接口，包括如下要求：

~~~js
Iterator [required] 
        next() {method}: 取得下一个IteratorResult
~~~

有些迭代器还扩展支持两个可选成员：
~~~js
Iterator [optional]
        return() {method}: 停止迭代器并返回IteratorResult
        throw() {method}: 报错并返回IteratorResult
~~~

IteratorResult 接口指定如下：
~~~js
IteratorResult
      value {property}: 当前迭代值或者最终返回值（如果undefined为可选的）
      done {property}: 布尔值，指示完成状态
~~~

> 我把这些接口称为隐式的，并不是因为它们没有在规范中显式说明——它们有说明！——而是因为它们没有暴露为代码可以访问的直接对象。在 ES6中，JavaScript 不支持任何“接口”的概念，所以你自己的代码符合规范只是单纯的惯用法。然而，在 JavaScript 期望迭代器的位置 ( 比如 for..of 循环 ) 所提供的东西必须符合这些接口，否则代码会失败。

还有一个 Iterable 接口，用来表述必需能够提供生成器的对象：
~~~js
Iterable
      @@iterator() {method}: 产生一个 Iterator
~~~

#### next()迭代

调用数组和字符串的[Symbol.iterator]方法可以生成迭代器

~~~js
var arr = [1,2,3];
var it = arr[Symbol.iterator]();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }

var greeting = "hello world";
var it = greeting[Symbol.iterator]();
it.next(); // { value: "h", done: false }
it.next(); // { value: "e", done: false }
..
~~~

ES6 还包括几个新的称为集合的数据结构，这些集合不仅本身是iterable，还提供了API方法来产生迭代器：

~~~js
var m = new Map();
m.set( "foo", 42 );
m.set( { cool: true }, "hello world" );
var it1 = m[Symbol.iterator]();
var it2 = m.entries();
it1.next(); // { value: [ "foo", 42 ], done: false }
it2.next(); // { value: [ "foo", 42 ], done: false }
...
~~~

#### 迭代器循环
ES6 的 for..of 循环直接消耗一个符合规范的 iterabl，
如果一个迭代器也是一个 iterable，那么它可以直接用于 for ... of 的循环。你可以通过为迭代
器提供一个 Symbol.iterator 方法简单返回这个迭代器本身使它成为 iterable：
~~~js
var it = {
// 使迭代器it成为iterable
  [Symbol.iterator]() { return this; },
  next() { .. },
  ..
};
it[Symbol.iterator]() === it; // true
~~~

~~~js
for (var v of it) {
  console.log( v );
}
~~~

要彻底理解这样的循环如何工作，可以回顾一下第 2 章 for..of 循环的等价 for 形式：
~~~js
for (var v, res; (res = it.next()) && !res.done; ) {
  v = res.value;
  console.log( v );
}
~~~
可以看到每次迭代之前都调用了 it.next() ，然后查看一下 res.done 。如果 res.done 为 true ，表达式求值为 false ，迭代就不会发生。

回忆一下，前面我们建议迭代器一般不应与最终预期的值一起返回 done: true 。现在能明
白其中的原因了吧。
如果迭代器返回 { done: true, value: 42 } ， for..of 循环会完全丢弃值 42 ，那么这个值就被丢失了。因为这个原因，假定你的迭代器可能会通过 for..of 循环或者手动的等价for 形式模式消耗，那么你应该等返回所有的相关迭代值之后，再返回 done: true 来标明迭代完毕。

#### 自定义迭代器
接下来考虑一个迭代器，它的设计意图是用来在一系列（也就是一个队列）动作上运行，一次一个条目
~~~js
var task = {
  [Symbol.iterator] () { 
    var steps = this.actions.slice()
    return {
      [Symbol.iterator] () { return this },
      next (...args) {
        if (steps.length > 0) {
          let res = steps.shift()(...args)
          return { value: res, done: false }
        } else {
          return { done: true }
        }
      }
    }
  },
  actions: []
}
~~~

~~~js
tasks.actions.push(
  function step1(x){
    console.log( "step 1:", x );
    return x * 2;
  },
  function step2(x,y){
    console.log( "step 2:", x, y );
    return x + (y * 2);
  },
  function step3(x,y,z){
    console.log( "step 3:", x, y, z );
    return (x * y) + z;
  }
);
var it = tasks[Symbol.iterator]();
it.next( 10 ); // step 1: 10
// { value: 20, done: false }
it.next( 20, 50 ); // step 2: 20 50
// { value: 120, done: false }
it.next( 20, 50, 120 ); // step 3: 20 50 120
// { value: 1120, done: false }
it.next(); // { done: true }
~~~

定义一个迭代器来进行单个数据上的操作

~~~js
if (!Number.prototype[Symbol.iterator]) {
  Object.defineProperty(
    Number.prototype, 
    Symbol.iterator, 
    {
      writable: true,
      configurable: true,
      enumerable: false,
      value: function iterator () {
        var i, inc, done = false, top = +this;
        // 正向还是反向迭代？
        inc = 1 * (top < 0 ? -1 : 1);
        return {
          [Symbol.iterator] () {return this},
          next () {
            if (!done) {
              if (i == null) {
                i = 0
              } else if (top >= 0) {
                i = Math.min(top, i + inc)
              } else {
                i = Math.max(top, i + inc)
              }

              if (i == top) done = true;
              return { value: i, done: false };
            } else {
              return { done: true };
            }
          }
        }
      }
    }
  )
}
~~~

#### 迭代器消耗

* 第一种是利用for...of一个一个消耗
* 第二种是利用spread运算符一次性消耗

~~~js
var a = [1,2,3,4]
var it = a[Symbol.iterator]()
var [...w] = it
ite.next() // {value: undefined, done: true}
w // [1, 2, 3, 4]
~~~

### 生成器

#### 语法

#### yield

* 普通的yield语法是暂停符号，也可以认为是表达式，可以想象return的机制，但是不会终止。
* yield 委托，语法和普通的yield差不多，但是机制不一样。对于yield...表达式，完成值来自于用it.next()恢复生成器的值，而对于yield *...表达式，完成值来自于北委托的迭代器的返回值。

yield *可以递归调用：
~~~js
function *foo (x) {
  if (x < 3) {
    x = yield *foo(x + 1)
  }
  return x * 2
}
var it = foo(1)
it.next() // {value: 24, done: true}
it.nexzt() // {value: undefined, done: true}
~~~
可以看出完全没有暂停。
#### 提前完成

#### 错误处理

#### Transpile 生成器

#### 生成器使用场景

### 模块

### 类