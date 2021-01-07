---
title: 笔记摘录-你不知道的JavaScript-上篇
img: 'https://placem.at/places?h=140'
date: '2017-09-16'
---

# toc

# 第一部分

## 第一章 作用域是什么？

存储和查找变量的规则。

### 1.1 编译原理：
* JavaScript实际上一门编译语言。任何JavaScript的代码在执行前都要进行编译。大部分的编译发生在代码执行前的几微妙（甚至更短）。
* 编译的三个过程：
  * 分词/词法分析
  * 解析/语法分析
  * 代码生成

### 1.2 作用域的理解
* 对 JavaScript 代码进行处理时需要参与的三个成员 引擎，编译器，作用域以及它们分别的作用。
* 作用域参与编译器和引擎的工作，协助编译器和引擎存储和查找变量

### 1.3 作用域嵌套
* 遍历嵌套作用域链的规则：引擎从当前的执行作用域开始查找变量，如果找不到，
就向上一级继续查找。当抵达最外层的全局作用域时，无论找到还是没找到，查找过程都
会停止。

### 1.4 异常
在普通模式下，执行 LHS 查询，如果直到顶层作用域都无法找到所需的变量，会在顶层作用域，隐式的创建一个。执行 RHS 查询，在所有的嵌套作用中，无法找到需要的变量，引擎会抛出 ReferenceError 异常。
在严格模式下（'use strict'），执行 LHS 查询，如果直到顶层作用域都无法找到所需的变量，不会在顶层作用域隐式的创建一个，引擎会抛出 ReferenceError 异常，因为严格模式不允许隐式创建变量。

---

## 第二章 词法作用域
作用域共有两种主要的工作模型，第一种最为普遍，被大多数编程语言所采用的词法作用域。另外一种叫做动态作用域，仍有一些编程语言在使用。JavaScript所采用的模型是词法作用域。
举个例子说明动态作用域和词法作用域的区别：
~~~js
function foo () {
  console.log(a)
}
function bar () {
  var a = 3
  foo()
}
var a = 2
bar() // 2
~~~
上边的代码 js 会输出 2，因为 foo 函数的 RHS 查找变量是通过全局的作用域进行查找的
如果 js 是动态语言，那么结果就会输出 3，动态作用域不关心函数是在何处声明的，只关心在何处调用。
### 2.1 词法阶段
在之前的[1.1编译原理](###1.1编译原理)中提到编译器工作的三个阶段，第一个是词法分析，大部分标准编译器的第一个工作阶段叫做词法化。
**简单的来说，词法作用域就是定义在词法阶段的作用域。换句话来说，词法作用域是由你在写代码时将变量和块作用域写在哪里来决定的，由此，当词法分析器处理代码时，会保持作用域不变**
### 2.2 词法欺骗
刚才所说，词法作用域完全由写代码期间函数所声明的位置来定义，怎样才能在运行时来“修改”（欺骗），词法作用域？

JavaScript 中有两种方式：eval 和 with

#### 2.2.1 eval
eval 函数可以接收一个字符串为参数，并且将其中内容作为好像在书写时就在当前位置的代码来执行。请看下面例子：
~~~js
function foo (str) {
  eval(str)
  console.log(a)
}
var a = 1
foo("var a = 3") // 3
~~~
eval 常用来动态创建代码，但是，在严格模式中，eval(...) 在运行时有其自己的作用域，意味着无法修改所在地作用域。
~~~js
function foo (str) {
  eval(str)
  console.log(a) // ReferenceError: a is not defined
}
foo("var a = 3") 
~~~
setTimeout(...) 和 setInterval(...) 的第一个参数可以是字符串，字符串的代码可以解释成正确的代码执行。这些功能已经过时，不要使用它。

new Function(...) 函数最后一个参数可以接收代码字符串，并且将其转化成动态代码。这种做法比eval(...)略微安全，但是，也要尽量避免使用。

#### with
通常被当作重复引用同一个对象的多个属性的快捷方式，可以不需要重复引用对象本身。
~~~js
var obj = {
  a: 1,
  b: 2,
  c: 3
}
obj.a = 4
obj.b = 5
obj.c = 6

with(obj) {
  a = 4
  b = 5
  c = 6
  d = 7
}

console.log(d) // 7
~~~
with 可以将一个没有或者多个属性的对象处理为一个完全隔离的词法作用域。实际上，是根据你传递给它的对象凭空创造一个新的词法作用域。比如，你传递 obj 给 with，实际上，with 以 obj 作为当前作用域，在 obj 中没有找到 d ，所以，在上层作用域中找，也没有，那么就创建了 d 变量。

---

## 第三章 函数作用域和块作用域
JavaScript是如何形成作用域气泡？

两种方式，一种是函数作用域，另一种是块作用域。

### 函数作用域
每次创建一个函数就可以为其自身创建一个作用域气泡。
### 块作用域
通过 with try/catch let const 等关键字形成的块级作用域。
其中try/catch 中的 catch 分句会创建块作用域，其中声明的变量只能在catch内部有效。

----

## 第四章 提升
先看下面代码：
~~~js
// ---
a = 2;
var a;
consoel.log(a) // 2
// ---
console.log(a) // undefined
var a = 2
~~~
通常我们理解的JavaScript的代码是一行一行从上往下执行，所以我们猜测上边代码会报 ReferenceError 错误。但是，由于 JavaScript 是先编译后执行，在编译阶段会收集所有的声明，虽然，我们看到的 a 声明代码在 赋值代码后面，但是，编译器已经提前在作用域中声明了 a，所以，在执行阶段，对 a 进行 RHS 查询，不会报错。这一个现象叫提升。

JavaScript 中除了上边的变量提升，还存在函数提升，不过只针对 function 关键字声明的函数。

---- 

## 第五章 作用域闭包
### 闭包
闭包的产生？

当函数记住并且访问词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

什么叫闭包？

~~~js
function foo () {
  var a = 2
  function bar () {
    console.log(a)
  }
  bar()
}
f00()
~~~
我们可以这么解释上边的代码，bar 函数在创建时是在 foo 函数内部，所以，bar 函数所适应访问的变量的规则时，当前作用域 -> foo作用域 -> foo外层作用域，bar 函数在执行的时候，根据作用域嵌套规则，首先会在当前作用域寻找 a，不存在就会往上寻找，而 foo 作用域 是可以访问到 a 的。
那么下边代码我们该如何解释？
~~~js
function foo () {
  var a = 2
  function bar () {
    console.log(a)
  }
  return bar
}
var baz = foo()
baz() // 2 闭包产生的效果
~~~
如果我们继续按照上边的思路去解释，那么我们会发现一个问题，由于JavaScript本身存在的垃圾回收机制，在 var baz = foo() 执行完后，foo 函数就应该会回收，所以 foo 中声明的所有上下文环境变量就该销毁，显然baz()执行的时候是无法找到 a 的。那么此处最终结果依然输出 2，可以看出 foo 在执行时生成的上下文环境变量没有被销毁，闭包阻止了垃圾回收。

个人的理解：
- 作用域
  * 同意书上JavaScript使用的是词法作用域，所以决定变量的使用范围是在词法分析阶段。
  * JavaScript作用域从范围来分，分为全局作用域和局部作用域，从不同的生成方式来分，分为函数作用域（由创建函数形成的作用域）和块级作用域（形成块级作用域的关键字声明形成）。
- 闭包

  当函数可以记住并访问所在的词法作用域，即使函数是在当前词法作用域之外执行，这时
  就产生了闭包。
  * 在函数A中返回函数B，函数B对函数A的作用域存在引用，我们就说函数A形成了闭包，函数B就是函数A的闭包。

---

# 第二部分

## 第一章 关于 this

### 对 this 的误解

* this 指向函数自身
~~~js
function foo(num) {
  console.log( "foo: " + num );
// 记录 foo 被调用的次数
  this.count++;
}
foo.count = 0;
var i;
for (i=0; i<10; i++) {
  if (i > 5) {
  foo( i );
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// foo 被调用了多少次？
console.log( foo.count ); // 0 -- WTF?
~~~
foo 调用实际上是增加了全局的 count。

**就针对上面的代码，如何回避以上问题：** 
* 第一种
~~~js
function foo(num) {
  console.log( "foo: " + num );
  // 记录 foo 被调用的次数
  data.count++;
}
var data = {
  count: 0
};
var i;
for (i=0; i<10; i++) {
  if (i > 5) {
  foo( i );
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// foo 被调用了多少次？
console.log( data.count ); // 4
~~~
创建一个对象来存储 count，回避掉 this 的问题，用词法作用域来解释。
* 第二种
~~~js
function foo(num) {
  console.log( "foo: " + num );
  // 记录 foo 被调用的次数
  foo.count++;
}
var data = {
  count: 0
};
var i;
for (i=0; i<10; i++) {
  if (i > 5) {
  foo( i );
  }
}
~~~
使用具名函数，指定函数名。
* 第三种
~~~js
function foo(num) {
  console.log( "foo: " + num );
  // 记录 foo 被调用的次数
  // 注意，在当前的调用方式下（参见下方代码），this 确实指向 foo
  this.count++;
}
foo.count = 0;
var i;
for (i=0; i<10; i++) {
  if (i > 5) {
  // 使用 call(..) 可以确保 this 指向函数对象 foo 本身
    foo.call( foo, i );
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// foo 被调用了多少次？
console.log( foo.count ); // 4
~~~
使用 call apply bind 这一类，强制绑顶 this 的指向。

* this 指向函数作用域
（说实话没看懂作者举的例子和当前的主题有啥干系）

#### 小结 

this 既不指向函数自身也不指向函数的词法作用域，this 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。

---

## 第二章 全面了解 this 
### this的绑定规则
#### 默认绑定

独立函数调用（作为普通的函数调用），在非严格的模式下，this 指向全局对象。在严格模式下，this 是 undefined。
~~~js
function foo () {
  console.log(this.a)
}
var a = 2
foo()
~~~
书上的说法是 foo 是直接使用不带任何修饰的函数引用进行调用的，因此只能使用默认绑定。

#### 隐式绑定
通常就是我们所说的把函数当做对象的属性调用，因此隐式绑定规则会把 this 绑定到这个上下文对象。还需要注意的一点是：对象属性引用链中只有最顶层或者说最后一层会影响调用位置。
~~~js
function foo() {
  console.log( this.a );
}
var obj2 = {
  a: 42,
  foo: foo
};
var obj1 = {
  a: 2,
  obj2: obj2
};
obj1.obj2.foo(); // 42
~~~
最后一层是 obj2，所有输出 obj2 的 a 属性值。

#### this 隐式丢失
~~~js
function foo () {
  console.log(this.a)
}
var obj = {
  a: 2,
  foo: foo
}
var bar = obj.foo // 函数别名
var a = 'oops. global'
bar() // oops, global
~~~
虽然 bar 和 obj.foo 是同一个引用，但是实际上，它引用的是 foo 函数本身，因此 bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定

一种更微妙、更常见的并且更加出乎意料的情况发生在传入回调函数时：
~~~js
function foo () {
  console.log(this.a)
}
function doFoo(fn) {
  // fn 其实引用的时 foo
  fn() // 调用位置
}
var obj = {
  a: 2,
  foo: foo
}
var a = 'oops, global'
doFoo(obj.foo) // oops global
~~~
参数传递的方式其实是一种隐式的赋值，因此，fn 其实还是对 foo 函数的引用，结果和上个例子一样。

如果把函数传入 JavaScript 内置函数会怎么样？

~~~js
function foo () {
  console.log(this.a)
}
var obj = {
  a: 2,
  foo: foo
}
var a = 'oops, global'
setTimeout(obj.foo, 100) // oops global
~~~
结果是一样的。因为传参数的方式是隐式的赋值，实际上就是执行了 var fn = obj.foo，然后执行了 fn()，显然又和上边的例子是一样的。

#### 显示绑定
~~~js
function foo(){
  console.log(this.a)
}
var obj = {
  a: 2
}
foo.call(obj) // 2
~~~
书上说的显示绑定就是指利用函数自带的 call(...) 和 apply(...) 方法，它们的第一个参数是一个对象，它们会把这个对象绑定到 this，接着调用函数时指定这个 this。
1. 硬绑定

但是，call 和 apply 解决了我们上边说的隐式丢失的问题吗？

~~~js
function foo() {
  console.log(this.a)
}
function doFoo(fn){
  fn()
}
var obj = {
  a: 2,
  foo: foo
}
var a = 'oops global'
doFoo.call(obj, obj.foo) // oops global
~~~
我们这里没有用 setTimeout 这一类内置函数，因为会报非法调用的错误。
最终结果来看，没有解决，那是为什么呢？我们来看下，虽然我们利用call绑定了调用函数 doFoo 的 this 指向 obj，但是，按照函数时赋值传参的规则，假设 var fn = obj.foo，所以我们在 doFoo 中实际是 fn() 这样调用函数的，解释还是和上边一样，是不带任何修饰的函数引用调用。我们这个时候就会想到，是不是只要再调用 foo 的时候改变 fn() 的 this 指向就可以了。
~~~js
function foo() {
  console.log(this.a)
}
function doFoo(fn){
  fn.call(obj) // 强制绑定 obj 调用
}
var obj = {
  a: 2,
  foo: foo
}
var a = 'oops global'
doFoo(obj.foo) // 2
~~~
看来我们的猜想没有错，我们来看下书上的写法：
~~~js
function foo() {
  console.log(this.a)
}
var obj = {
  a: 2
}
var bar = function () {
  foo.call(obj)
}
var a = 'oops global'
bar()
setTimeout(bar, 100) // 2
~~~
书上的写法更加直接，无论之后怎么调用 bar 都会 手动在 obj 上调用 foo，这种绑定是一种显示的强制绑定，称之为硬绑定。

硬绑定的典型场景就是创建一个包裹函数，传入所有的参数并且返回接收到的所有值：
~~~js
// foo 就是包裹函数
function foo(something) {
  console.log(this.a, something)
  return this.a + something
}
var obj = {
  a: 2
}
var bar = function () {
  // foo 就是包裹函数
  return foo.apply(obj, arguments)
}
var b = bar(3) // 2 3
console.log(b) // 5
~~~
另外一种是创建一个可以重复使用的函数，我们可以想象如果要创造一个 bar 函数来进行封装：
~~~js
function bind(obj, fn) {
  return function () {
    return fn.apply(obj, arguments)
  }
}
function foo(something) {
  console.log(this.a, something)
  return this.a + something
}
var obj = {
  a: 2
}
var bar = bind(obj, foo) 
var b = bar(3) // 2 3
console.log(b) // 5
~~~
没错这就是我们常用的 bind 函数的功能，因为硬绑定非常常用，所以，在 ES5 中提供了内置的方法 Function.prototype.bind 方法。
2. API 调用的'上下文'

JavaScript的许多库和内置函数都提供了一个可选的参数，通常称为上下文，效果和bind一样，比如：

~~~js
function foo () {
  console.log(this.a)
}
var obj = {
  a: 4
}
[1,2,3].forEach(foo, obj) // 4 4 4
[1,2,3].map(foo, obj) // 4 4 4
~~~
前提这个 foo 不能是 es6 的箭头函数，否则不能绑定 this

#### new 操作符绑定

使用 new 来调用函数，会自动执行下面的操作：

* 创建一个全新的对象
* 这个新对象会被执行原型链接
* 这个新对象会被绑定到函数调用的 this
* 如果函数没有返回其他对象，那么 new 表达式中的函数会调用自动返回的这个新对象

~~~js
function foo(a) {
this.a = a;
}
var bar = new foo(2);
console.log( bar.a ); // 2
~~~

### 四种绑定的优先级

1. 隐式绑定和显示绑定

~~~js
function foo () {
  console.log(this.a)
}
var obj1 = {
  a: 2,
  foo: foo
}
var obj2 = {
  a: 3,
  foo: foo
}
obj1.foo() // 2
obj2.foo() // 3

obj1.foo.call(obj2) // 3
obj2.foo.call(obj1) // 2
~~~
显示绑定 > 隐式绑定

2. 隐式绑定和 new 绑定

~~~js
function foo(something) {
  this.a = something
}
var obj1 = {
  foo: foo
}

obj1.foo(1)
console.log(obj1.a) // 1

var bar = new obj1.foo(4)
console.log(obj1.a) // 1
console.log(bar.a) // 4
~~~
可以看出 new 绑定 > 隐式绑定

3. new 绑定与显示绑定

一般的显示绑定无法和 new 比较，因为无法通过 new foo.call(obj)，但是，可以通过硬绑定进行测试。

~~~js
function foo(something) {
  this.a = something
}
var obj = {
  foo: foo
}
obj.foo(1)
console.log(obj.a) // 1
var bar = new (foo.bind(obj, 2))
console.log(bar.a) // 2
~~~
结果是 new 绑定 > 硬绑定，我们拿上边硬绑定那一节写的 bind 来看下
~~~js
function foo(something) {
  this.a = something
}
function bind(obj, fn) {
  return function () {
    return fn.apply(obj, arguments)
  }
}
var obj = {
  foo: foo
}
obj.foo(1)
console.log(obj.a) // 1
var bar = bind(obj, foo)
var baz = new bar(2)
console.log(baz.a) // undefined
console.log(obj.a) // 2
~~~
显然无法改变 this 的指向，所以，JavaScript 内置的 bind 在内部肯定还有其他的实现。

因为 bind 是在 es5 才加入 JavaScript内置语法，所以，有些浏览器还需要做兼容性处理，下边是 mdn 上一种 bind 的 Pollyfill 实现：
~~~js
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          // this instanceof fNOP === true时,说明返回的fBound被当做new的构造函数调用
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };
      // 维护原型关系
    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    // 下行的代码使fBound.prototype是fNOP的实例,因此
    // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是fNOP的实例
    fBound.prototype = new fNOP();

    return fBound;
  }
}
~~~

针对上边的判断使用哪个 this 的写法目前还不理解，估计得等看完原型那块内容。

#### 如何判断 this
1. 函数是否在 new 中调用（ new 绑定）？如果是的话 this 绑定的是新创建的对象。
  var bar = new foo()
2. 函数是否通过 call 、 apply （显式绑定）或者硬绑定调用？如果是的话， this 绑定的是指定的对象。
var bar = foo.call(obj2)
3. 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话， this 绑定的是那个上
下文对象。
var bar = obj1.foo()
4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined ，否则绑定到
全局对象。
var bar = foo()

### 绑定例外

#### 被忽略的 this

在某些情况下进行显示绑定将 this 指定为 null，如果调用的函数确实不关心 this 是没有什么问题，但是，如果使用到 this，那么有可能造成内部错误，尤其是针对第三方的库，这种方式可能会导致许多难以分析和追踪的 bug。

#### 更加安全的 this 

DMZ 空的非委托对象，这个概念目前还没理解~~~

#### 间接引用

另一个需要注意的是，你有可能（有意或者无意地）创建一个函数的“间接引用”，在这
种情况下，调用这个函数会应用默认绑定规则。
间接引用最容易在赋值时发生：
~~~js
function foo() {
  console.log( this.a );
}
var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };
o.foo(); // 3
(p.foo = o.foo)(); // 2
~~~
赋值表达式 p.foo = o.foo 的返回值是目标函数的引用，因此调用位置是 foo() 而不是
p.foo() 或者 o.foo() 。根据我们之前说过的，这里会应用默认绑定。

#### 软绑定

就是指给默认绑定指定一个全局对象和 undefined 以外的值，那就可以实现和硬绑定相同的效果，同时保留隐式绑定或者显示绑定修改 this 的能力。

~~~js
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function (obj) {
    var fn = this
    var curried = [].slice.call(arguments, 1)
    var bound = function () {
      return fn.apply(
        (!this || this === (window || global) ? obj: this),
        curried.concat.apply(curried, arguments)
      )
    }
    bound.prototype = Object.create(fn.prototype)
    return bound
  }
}
~~~

### this 词法

上述的四种规则适合所有的正常函数，但是，es6 的箭头函数不适用 this 的四种规则，而是根据外层（函数或者全局的作用域来决定）
~~~js
function foo() {
// 返回一个箭头函数
  return (a) => {
    //this 继承自 foo()
    console.log( this.a );
  };
}
var obj1 = {
  a:2
};
var obj2 = {
  a:3
  100 
};
var bar = foo.call( obj1 ); // 箭头函数已经捕获 this 为 obj1，箭头函数的this绑定无法被改变
bar.call( obj2 ); // 2, 不是 3 ！
~~~
---
## 第三章 对象
### 语法
~~~js
// 第一种
var obj = {}
// 第二种
var obj = new Object()
~~~
### 类型
JavaScript主要有六种类型
* string
* number
* boolean
* null
* undefined
* object

简单基本类型（ string 、 boolean 、 number 、 null 和 undefined ）本身并不是对象。

null 有时会被当作一种对象类型，但是这其实只是语言本身的一个 bug，即对 null 执行
typeof null 时会返回字符串 "object" 。 1 实际上， null 本身是基本类型。
有一种常见的错误说法是“JavaScript 中万物皆是对象”，这显然是错误的。

实际上，JavaScript 中有许多特殊的对象子类型，我们可以称之为复杂基本类型。
函数就是对象的一个子类型（从技术角度来说就是“可调用的对象”）。JavaScript 中的函
数是“一等公民”，因为它们本质上和普通的对象一样（只是可以调用），所以可以像操作
其他对象一样操作函数（比如当作另一个函数的参数）。

数组也是对象的一种类型，具备一些额外的行为。数组中内容的组织方式比一般的对象要
稍微复杂一些。

### 内置对象

~~~js
* String
* Number
* Boolean
* Object
* Function
* Array
* Date
* RegExp
* Error
~~~

在JavaScript中他们只是一些内置函数，可以当做构造函数来使用。

~~~js
var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"
~~~
javascript引擎会自动将字面量转换成String对象，所以可以访问属性和方法。同样适用于数值字面量。

### 内容

获取属性值的方法有两种
~~~js
// 属性访问
.key
// 键访问
[key]
~~~

#### 可就算属性名

ES6 增加了可计算属性名，可以在文字形式中使用 [] 包裹一个表达式来当作属性名
~~~js
var prefix = "foo";
var myObject = {
[prefix + "bar"]:"hello",
[prefix + "baz"]: "world"
};
myObject["foobar"]; // hello
myObject["foobaz"]; // world
~~~

#### 复制对象

~~~js
function anotherFunction() { /*..*/ }
var anotherObject = {
  c: true
};
var anotherArray = [];
var myObject = {
  a: 2,
  b: anotherObject, // 引用，不是复本！
  c: anotherArray, // 另一个引用！
  d: anotherFunction
};
anotherArray.push( anotherObject, myObject );

// 浅复制
var newObj = Object.assign( {}, myObject );
~~~

深复制还需要注意循环引用的问题。

#### 属性描述符

从 ES5 开始，所有的属性都具备了属性描述符

~~~js
var myObject = {
  a:2
};
Object.getOwnPropertyDescriptor( myObject, "a" );
// {
// value: 2,
// writable: true,
// enumerable: true,
// configurable: true
// }
~~~

通过 Object.getOwnPropertyDescriptor(...) 可以获取属性的描述对象，包含 value（属性值），writable（可写的），enumerable（可枚举），configurable（可配置）

在创建普通属性时，属性描述符会使用默认值，可以通过 Object.defineProperty(...)针对上边的几个值来进行设置。

~~~js
var myObject = {};
Object.defineProperty( myObject, "a", {
  value: 2,
  writable: true,
  configurable: true,
  enumerable: true
} );
myObject.a; // 2
~~~

1. writable

控制属性值是否能被写入，设置为 false 时，将无法对属性进行赋值操作。

2. configurable

控制属性值是否可以被配置。也就是说对于可配置的属性值，将其configurable设置为false，那么无法再次使用 Object.defineProperty(...)来将configurable设置为 true，把 configurable 修改成
false 是单向操作，无法撤销！
> 要注意有一个小小的例外：即便属性是 configurable:false ， 我们还是可以
> 把 writable 的状态由 true 改为 false ，但是无法由 false 改为 true 。

除了无法修改， configurable:false 还会禁止删除这个属性
~~~js
var myObject = {
  a:2
};
myObject.a; // 2
delete myObject.a;
myObject.a; // undefined
Object.defineProperty( myObject, "a", {
  value: 2,
  writable: true,
  configurable: false,
  enumerable: true
} );
myObject.a; // 2
delete myObject.a;
myObject.a; // 2
~~~

在本例中， delete 只用来直接删除对象的（可删除）属性。如果对象的某个属性是某个
对象 / 函数的最后一个引用者，对这个属性执行 delete 操作之后，这个未引用的对象 / 函数就可以被垃圾回收。但是，不要把 delete 看作一个释放内存的工具（就像 C/C++ 中那
样），它就是一个删除对象属性的操作，仅此而已。

3.  Enumerable

这个描述符控制的是属性是否会出现在对象的属性枚举中，比如说
for..in 循环。如果把 enumerable 设置成 false ，这个属性就不会出现在枚举中，虽然仍
然可以正常访问它。相对地，设置成 true 就会让它出现在枚举中。

#### 不变性

有时候你会希望属性或者对象是不可改变（无论有意还是无意）的，在 ES5 中可以通过很
多种方法来实现。

很重要的一点是，所有的方法创建的都是浅不变形，也就是说，它们只会影响目标对象和
它的直接属性。如果目标对象引用了其他对象（数组、对象、函数，等），其他对象的内
容不受影响，仍然是可变的：

1. 对象常量
结合 writable:false 和 configurable:false 就可以创建一个真正的常量属性（不可修改、
重定义或者删除）：
~~~js
var obj1 = {a: 123}
var obj2 = {b: obj1}
Object.defineProperty(obj2, 'b', {writable: false, configurable: false})
obj1.a = 456
console.log(obj2.b) // 456
~~~
无法直接通过 obj2.b = ... 写入，但是，可以改变 obj2.b 的引用对象

2. 禁止扩展

如果你想禁止一个对象添加新属性并且保留已有属性，可以使用 Object.prevent
Extensions(..) ：

~~~js
var myObject = {
  a:2
};
Object.preventExtensions( myObject );
myObject.b = 3;
myObject.b; // undefined
~~~
在非严格模式下，创建属性 b 会静默失败。在严格模式下，将会抛出 TypeError 错误。

3. 密封

Object.seal(..) 会创建一个“密封”的对象，这个方法实际上会在一个现有对象上调用
Object.preventExtensions(..) 并把所有现有属性标记为 configurable:false 。

所以，密封之后不仅不能添加新属性，也不能重新配置或者删除任何现有属性（虽然可以
修改属性的值）。

4. 冻结

Object.freeze(..) 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用
Object.seal(..) 并把所有“数据访问”属性标记为 writable:false ，这样就无法修改它们
的值。

这个方法是你可以应用在对象上的级别最高的不可变性，它会禁止对于对象本身及其任意
直接属性的修改（不过就像我们之前说过的，这个对象引用的其他对象是不受影响的）。
你可以“深度冻结”一个对象，具体方法为，首先在这个对象上调用 Object.freeze(..) ，
然后遍历它引用的所有对象并在这些对象上调用 Object.freeze(..) 。但是一定要小心，因
为这样做有可能会在无意中冻结其他（共享）对象。

### getter 和 setter

在 ES5 中可以使用 getter 和 setter 部分改写默认操作，但是只能应用在单个属性上，无法
应用在整个对象上。getter 是一个隐藏函数，会在获取属性值时调用。setter 也是一个隐藏
函数，会在设置属性值时调用。

当你给一个属性定义 getter、setter 或者两者都有时，这个属性会被定义为“访问描述
符”（和“数据描述符”相对）。对于访问描述符来说，JavaScript 会忽略它们的 value 和
writable 特性，取而代之的是关心 set 和 get （还有 configurable 和 enumerable ）特性。

~~~js
var myObject = {
// 给 a 定义一个 getter
  get a() {
    return 2;
  }
};
Object.defineProperty(
myObject, // 目标对象
"b", // 属性名
  { // 描述符
    // 给 b 设置一个 getter
    get: function(){ return this.a * 2 },
    // 确保 b 会出现在对象的属性列表中
    enumerable: true
  }
);
myObject.a; // 2
myObject.b; // 4
~~~

### 存在性

通过 obj.key 访问属性的返回值可能是 undefined，但是这个值可能是对象中属性值为 undefined，或者不存在这个属性。

~~~js
var myObject = {
a:2
};
("a" in myObject); // true
("b" in myObject); // false
myObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "b" ); // false
~~~
in 操作符会检查属性是否在对象及其 [[Prototype]] 原型链中，相比之下，
hasOwnProperty(..) 只会检查属性是否在 myObject 对象中，不会检查 [[Prototype]] 链

但是如果是针对Object.create(null) 的对象，是无法调用 hasOwnProperty 的，可以通过
~~~js
 Object.prototype.hasOwnProperty.call(myObject,"a") 
~~~
它借用基础的 hasOwnProperty(..) 方法并把它显式绑定到 myObject 上

in 操作符和 hasOwnProperty 无论属性是否可枚举都可以找到，那么如何区分属性是不是可枚举呢？

* for ... in 不会遍历不可枚举的属性
* propertyIsEnumerable(...) 会检查给定的属性名是否直接存在于对象中（而不是在原型链上）并且满足 enumerable:true 。

Object.keys(..) 会返回一个数组，包含所有可枚举属性， Object.getOwnPropertyNames(..)会返回一个数组，包含所有属性，无论它们是否可枚举。

in 和 hasOwnProperty(..) 的区别在于是否查找 [[Prototype]] 链，然而，Object.keys(..)和 Object.getOwnPropertyNames(..) 都只会查找对象直接包含的属性。

---

## 第四章 混合对象类

### 类理论

类/继承描述了一种代码的组织结构形式---一种在软件中对真实世界问题领域的建模方法。

类的另一个核心概念是多态，这个概念是说父类的通用行为可以被子类用更特殊的行为重
写。实际上，相对多态性允许我们从重写行为中引用基础行为。

#### 类设计模式

类是一种设计模式

#### JavaScript中的类

由于类是一种设计模式，所以你可以用一些方法（本章之后会介绍）近似实现类的功能。
为了满足对于类设计模式的最普遍需求，JavaScript 提供了一些近似类的语法。其他语言中的类和 JavaScript
中的“类”并不一样。

#### 类的继承

多态并不表示子类和父类有关联，子类得到的只是父类的一份副本。类的继承其实就是
复制。

#### 混入

在继承或者实例化时，JavaScript 的对象机制并不会自动执行复制行为。简单来说，
JavaScript 中只有对象，并不存在可以被实例化的“类”。一个对象并不会被复制到其他对
象，它们会被关联起来（参见第 5 章）。

由于在其他语言中类表现出来的都是复制行为，因此 JavaScript 开发者也想出了一个方法来
模拟类的复制行为，这个方法就是混入。接下来我们会看到两种类型的混入：显式和隐式。

#### 显示混入

由于 JavaScript 不会自动实现 Vehicle
到 Car 的复制行为，所以我们需要手动实现复制功能。这个功能在许多库和框架中被称为
extend(..) ，但是为了方便理解我们称之为 mixin(..) 。
~~~js
function mixin (sourceObj, targetObju) {
  for (var key in sourceObj) {
    if (!(key in target)) {
      targetObj[key] = sourceObj[key]
    }
  }
}
~~~

但是上边这一类写法复制的只是引用，所以，如果 target 中的引用改变可能会引起sourceObj中的改变。

~~~js
// 另一种混入函数，可能有重写风险
function mixin( sourceObj, targetObj ) {
  for (var key in sourceObj) {
  targetObj[key] = sourceObj[key];
  }
  return targetObj;
}
var Vehicle = {
// ...
};
// 首先创建一个空对象并把 Vehicle 的内容复制进去
var Car = mixin( Vehicle, { } );
// 然后把新内容复制到 Car 中
mixin( {
  wheels: 4,
  drive: function() {
  // ...
  }
}, Car );
~~~
上边这类写法可以不进行判断是否存在相同的属性。但是，还是存在和上一个写法同样的问题，

#### 寄生继承

~~~js
// “传统的 JavaScript 类”Vehicle
function Vehicle() {
  this.engines = 1;
}
Vehicle.prototype.ignition = function() {
  console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
  this.ignition();
  console.log( "Steering and moving forward!" );
};
// “寄生类” Car
function Car() {
  // 首先，car 是一个 Vehicle
  var car = new Vehicle();
  // 接着我们对 car 进行定制
  car.wheels = 4;
  // 保存到 Vehicle::drive() 的特殊引用
  var vehDrive = car.drive;
  // 重写 Vehicle::drive()
  car.drive = function() {
  vehDrive.call( this );
  console.log(
  "Rolling on all " + this.wheels + " wheels!"
  );
  return car;
}
var myCar = new Car();
myCar.drive();
~~~

在 Car 中直接实例化 Vehicle，添加覆盖实例的属性并且返回，之后再外边实例化 Car 的时候无需 new 调用。

#### 隐式混入

~~~js
var Something = {
  cool: function() {
    this.greeting = "Hello World";
    this.count = this.count ? this.count + 1 : 1;
  }
};
Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1
var Another = {
  cool: function() {
  // 隐式把 Something 混入 Another
    Something.cool.call( this );
  }
};
Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 （count 不是共享状态）
~~~

---

## 第五章原型

### [[prototype]]

javaScript 中的对象有一个特殊的 [[Prototype]] 内置属性，其实就是对于其他对象的引
用。几乎所有的对象在创建时 [[Prototype]] 属性都会被赋予一个非空的值。

#### [[prototype]] 作用

当你试图访问对象属性时候，会触发 [[get]] 操作。比如 myObject.a 。对于默认的 [[Get]] 操作来说，第一步是检查对象本身是否有这个属性，如果有的话就使用它。

对于默认的 [[Get]] 操作来说，如果无法在对象本身找到需要的属性，就会继续访问对象
的 [[Prototype]] 链

~~~js
var anotherObject = {
  a:2
};
// 创建一个关联到 anotherObject 的对象
var myObject = Object.create( anotherObject );
myObject.a; // 2
~~~
Object.create(...) 会创建一个
对象并把这个对象的 [[Prototype]] 关联到指定的对象。

for..in 循环可以用来遍历对象的可枚举属性列表（包括 [[Prototype]] 链）
~~~js
var anotherObject = {
  a:2
};
// 创建一个关联到 anotherObject 的对象
var myObject = Object.create( anotherObject );
for (var k in myObject) {
console.log("found: " + k);
}
// found: a
("a" in myObject); // true
~~~

#### [[prototype]] 尽头

所有普通的 [[Prototype]] 链最终都会指向内置的 Object.prototype 

#### 属性设置和屏蔽

~~~js
myObject.foo = "bar";
~~~

1. 如果 myObject 对象中包含名为 foo 的普通数据访问属性，这条赋值语句只会修改已有的属
性值。

2. 如果 foo 不是直接存在于 myObject 中， [[Prototype]] 链就会被遍历，类似 [[Get]] 操作。如果原型链上找不到 foo ， foo 就会被直接添加到 myObject 上。

3. 然而，如果 foo 存在于原型链上层，赋值语句 myObject.foo = "bar" 的行为就会有些不同（而且可能很出人意料）。

4. 如果属性名 foo 既出现在 myObject 中也出现在 myObject 的 [[Prototype]] 链上层，那么就会发生屏蔽。 myObject 中包含的 foo 属性会屏蔽原型链上层的所有 foo 属性，因为myObject.foo 总是会选择原型链中最底层的 foo 属性。

下面我们分析一下如果 foo 不直接存在于 myObject 中而是存原型在于原型链上层时 myObject.foo = "bar" 会出现的三种情况:

1. 如果在 [[Prototype]] 链上层存在名为 foo 的普通数据访问属性（参见第 3 章）并且没有被标记为只读（ writable:false ），那就会直接在 myObject 中添加一个名为 foo 的新属性，它是屏蔽属性。
2. 如果在 [[Prototype]] 链上层存在 foo ，但是它被标记为只读（ writable:false ），那么无法修改已有属性或者在 myObject 上创建屏蔽属性。如果运行在严格模式下，代码会
抛出一个错误。否则，这条赋值语句会被忽略。总之，不会发生屏蔽。
3. 如果在 [[Prototype]] 链上层存在 foo 并且它是一个 setter（参见第 3 章），那就一定会调用这个 setter。 foo 不会被添加到（或者说屏蔽于） myObject ，也不会重新定义 foo 这个 setter。

#### 类函数

多年以来，JavaScript 中有一种奇怪的行为一直在被无耻地滥用，那就是模仿类。我们会
仔细分析这种方法。
这种奇怪的“类似类”的行为利用了函数的一种特殊特性：所有的函数默认都会拥有一个
名为 prototype 的公有并且不可枚举（参见第 3 章）的属性，它会指向另一个对象：

~~~js
function Foo() {
// ...
}
Foo.prototype; // { }
~~~

这个对象通常被称为 Foo 的原型，因为我们通过名为 Foo.prototype 的属性引用来访问它。

这个对象到底是什么？

最直接的解释就是，这个对象是在调用 new Foo() （参见第 2 章）时创建的，最后会被
（有点武断地）关联到这个“Foo 点 prototype”对象上。

~~~js
function Foo() {
// ...
}
var a = new Foo();
// 获取 a 的原型
Object.getPrototypeOf( a ) === Foo.prototype; // true
// Foo.prototype 是 a 的原型
Foo.prototype.isPrototypeOf(a) // true
~~~

new Foo() 会生成一个新对象（我们称之为 a ），这个新对象的内部链接 [[Prototype]] 关联的是 Foo.prototype 对象。

最后我们得到了两个对象，它们之间互相关联，就是这样。我们并没有初始化一个类，实
际上我们并没有从“类”中复制任何行为到一个对象中，只是让两个对象互相关联。

实际上，绝大多数 JavaScript 开发者不知道的秘密是， new Foo() 这个函数调用实际上并没有直接创建关联，这个关联只是一个意外的副作用。 new Foo() 只是间接完成了我们的目
标：一个关联到其他对象的新对象。

那么有没有更直接的方法来做到这一点呢？当然！功臣就是 Object.create(..) ，不过我们
现在暂时不介绍它。


继承意味着复制操作，JavaScript（默认）并不会复制对象属性。相反，JavaScript 会在两
个对象之间创建一个关联，这样一个对象就可以通过委托访问另一个对象的属性和函数。
委托（参见第 6 章）这个术语可以更加准确地描述 JavaScript 中对象的关联机制。

### 构造函数

到底是什么让我们认为 Foo 是一个构造函数？

一个原因是我们看到了 new 关键字，在面向类的语言中构造类实例时也会用到它。另
一个原因是，看起来我们执行了类的构造函数方法， Foo() 的调用方式很像初始化类时类
构造函数的调用方式。

除了令人迷惑的“构造函数”语义外， Foo.prototype 还有另一个绝招。

~~~js
function Foo() {
// ...
}
Foo.prototype.constructor === Foo; // true
var a = new Foo();
a.constructor === Foo; // true
~~~

Foo.prototype 默认（在代码中第一行声明时！）有一个公有并且不可枚举（参见第 3 章）
的属性 .constructor ，这个属性引用的是对象关联的函数（本例中是 Foo ）。此外，我们
可以看到通过“构造函数”调用 new Foo() 创建的对象也有一个 .constructor 属性，指向
“创建这个对象的函数”。

1. 构造函数还是调用

上一段代码很容易让人认为 Foo 是一个构造函数，因为我们使用 new 来调用它并且看到它
“构造”了一个对象。

实际上， Foo 和你程序中的其他函数没有任何区别。函数本身并不是构造函数，然而，当
你在普通的函数调用前面加上 new 关键字之后，就会把这个函数调用变成一个“构造函数
调用”。实际上， new 会劫持所有普通函数并用构造对象的形式来调用它。

~~~js
function NothingSpecial() {
  console.log( "Don't mind me!" );
}
var a = new NothingSpecial();
// "Don't mind me!"
a; // {}
~~~

NothingSpecial 只是一个普通的函数，但是使用 new 调用时，它就会构造一个对象并赋值
给 a ，这看起来像是 new 的一个副作用（无论如何都会构造一个对象）。这个调用是一个构
造函数调用，但是 NothingSpecial 本身并不是一个构造函数。

换句话说，在 JavaScript 中对于“构造函数”最准确的解释是，所有带 new 的函数调用。
函数不是构造函数，但是当且仅当使用 new 时，函数调用会变成“构造函数调用”。

之前讨论 .constructor 属性时我们说过，看起来 a.constructor === Foo 为真意味着 a 确实有一个指向 Foo 的 .constructor 属性，但是事实不是这样。这是一个很不幸的误解。实际上， .constructor 引用同样被委托给了 Foo.prototype ，而Foo.prototype.constructor 默认指向 Foo 。

把 .constructor 属性指向 Foo 看作是 a 对象由 Foo“构造”非常容易理解，但这只不过
是一种虚假的安全感。 a.constructor 只是通过默认的 [[Prototype]] 委托指向 Foo ，这和“构造”毫无关系。


举例来说， Foo.prototype 的 .constructor 属性只是 Foo 函数在声明时的默认属性。如果
你创建了一个新对象并替换了函数默认的 .prototype 对象引用，那么新对象并不会自动获
得 .constructor 属性。
~~~js
function Foo() { /* .. */ }
Foo.prototype = { /* .. */ }; // 创建一个新原型对象
var a1 = new Foo();
a1.constructor === Foo; // false!
a1.constructor === Object; // true!
~~~

a1 并没有 .constructor 属性，所以它会委托 [[Prototype]] 链上的 Foo.prototype 。但是这个对象也没有 .constructor 属性（不过默认的 Foo.prototype 对象有这
个属性！），所以它会继续委托，这次会委托给委托链顶端的 Object.prototype 。这个对象
有 .constructor 属性，指向内置的 Object(..) 函数。

~~~js
function Foo() { /* .. */ }
Foo.prototype = { /* .. */ }; // 创建一个新原型对象
// 需要在 Foo.prototype 上“修复”丢失的 .constructor 属性
// 新对象属性起到 Foo.prototype 的作用
// 关于 defineProperty(..)，参见第 3 章
Object.defineProperty( Foo.prototype, "constructor" , {
  enumerable: false,
  writable: true,
  configurable: true,
  value: Foo // 让 .constructor 指向 Foo
} );
~~~
.constructor 并不是一个不可变属性。它是不可枚举（参见上面的代码）的，但是它的值
是可写的（可以被修改）。此外，你可以给任意 [[Prototype]] 链中的任意对象添加一个名
为 constructor 的属性或者对其进行修改，你可以任意对其赋值。

a1.constructor 是一个非常不可靠并且不安全的引用。通常来说要尽量避免使用这些引用。

### 原型继承

~~~js
function Foo(name) {
  this.name = name;
}
Foo.prototype.myName = function() {
  return this.name;
};
function Bar(name,label) {
  Foo.call( this, name );
  this.label = label;
}
// 我们创建了一个新的 Bar.prototype 对象并关联到 Foo.prototype
Bar.prototype = Object.create( Foo.prototype );
// 注意！现在没有 Bar.prototype.constructor 了
// 如果你需要这个属性的话可能需要手动修复一下它
Bar.prototype.myLabel = function() {
  return this.label;
};
var a = new Bar( "a", "obj a" );
a.myName(); // "a"
a.myLabel(); // "obj a"
~~~

这段代码的核心部分就是语句 Bar.prototype = Object.create( Foo.prototype ) 。调用Object.create(..) 会凭空创建一个“新”对象并把新对象内部的 [[Prototype]] 关联到你指定的对象（本例中是 Foo.prototype ）。

声明 function Bar() { .. } 时，和其他函数一样， Bar 会有一个 .prototype 关联到默认的
对象，但是这个对象并不是我们想要的 Foo.prototype 。因此我们创建了一个新对象并把
它关联到我们希望的对象上，直接把原始的关联对象抛弃掉。
注意，下面这两种方式是常见的错误做法，实际上它们都存在一些问题：
~~~js
// 和你想要的机制不一样！
Bar.prototype = Foo.prototype;
// 基本上满足你的需求，但是可能会产生一些副作用 :(
Bar.prototype = new Foo();
~~~

Bar.prototype = Foo.prototype 并不会创建一个关联到 Bar.prototype 的新对象，它只
是让 Bar.prototype 直接引用 Foo.prototype 对象。因此当你执行类似 Bar.prototype.
myLabel = ... 的赋值语句时会直接修改 Foo.prototype 对象本身。显然这不是你想要的结果，否则你根本不需要 Bar 对象，直接使用 Foo 就可以了，这样代码也会更简单一些。

Bar.prototype = new Foo() 的确会创建一个关联到 Bar.prototype 的新对象。但是它使用了 Foo(..) 的“构造函数调用”，如果函数 Foo 有一些副作用（比如写日志、修改状态、注册到其他对象、给 this 添加数据属性，等等）的话，就会影响到 Bar() 的“后代”，后果
不堪设想。

因此，要创建一个合适的关联对象，我们必须使用 Object.create(..) 而不是使用具有副
作用的 Foo(..) 。这样做唯一的缺点就是需要创建一个新对象然后把旧对象抛弃掉，不能
直接修改已有的默认对象。

如果能有一个标准并且可靠的方法来修改对象的 [[Prototype]] 关联就好了。在 ES6 之前，我们只能通过设置 .__proto__ 属性来实现，但是这个方法并不是标准并且无法兼容所有浏览器。ES6 添加了辅助函数 Object.setPrototypeOf(..) ，可以用标准并且可靠的方法来修改关联。

我们来对比一下两种把 Bar.prototype 关联到 Foo.prototype 的方法：

~~~js
// ES6 之前需要抛弃默认的 Bar.prototype
Bar.ptototype = Object.create( Foo.prototype );
// ES6 开始可以直接修改现有的 Bar.prototype
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
~~~

#### 检查类关系
检查一个实例（JavaScript 中的对象）的继承祖先（JavaScript 中的委托关联）通常被称为内省（或者反射）。
~~~js
function Foo() {
// ...
}
Foo.prototype.blah = ...;
var a = new Foo();
a instanceof Foo; // true
~~~

~~~JS
function isRelatedTo(o1, o2) {
function F(){}
  F.prototype = o2;
  return o1 instanceof F;
}
var a = {};
var b = Object.create( a );
isRelatedTo( b, a ); // true
~~~

~~~JS
Foo.prototype.isPrototypeOf( a )
~~~

上边两段代码效果一样，第二种方法中并不需要间接引用函数（ Foo ），它的 .prototype 属性会被自动访问。换句话说，语言内置的 isPrototypeOf(..) 函数就是我们的 isRelatedTo(..) 函数。

我们也可以直接获取一个对象的 [[Prototype]] 链。在 ES5 中，标准的方法是：

    Object.getPrototypeOf( a );

可以验证一下，这个对象引用是否和我们想的一样：

    Object.getPrototypeOf( a ) === Foo.prototype; // true

绝大多数（不是所有！）浏览器也支持一种非标准的方法来访问内部 [[Prototype]] 属性：

    a.__proto__ === Foo.prototype; // true

这个奇怪的 .__proto__ （在 ES6 之前并不是标准！）属性“神奇地”引用了内部的
[[Prototype]] 对象，如果你想直接查找（甚至可以通过 .__proto__.__ptoto__... 来遍历）原型链的话，这个方法非常有用。

.__proto__ 的实现大致上是这样的（对象属性的定义参见第 3 章）：
~~~js
Object.defineProperty( Object.prototype, "__proto__", {
  get: function() {
    return Object.getPrototypeOf( this );
  },
  set: function(o) {
  // ES6 中的 setPrototypeOf(..)
    Object.setPrototypeOf( this, o );
    return o;
  }
} );
~~~

### 对象关联

[[Prototype]] 机制就是存在于对象中的一个内部链接，它会引用其他对象。

通常来说，这个链接的作用是：如果在对象上没有找到需要的属性或者方法引用，引擎就
会继续在 [[Prototype]] 关联的对象上进行查找。

### 创建关联

那 [[Prototype]] 机制的意义是什么呢？为什么 JavaScript 开发者费这么大的力气（模拟类）在代码中创建这些关联呢？

Object.create(..) 会创建一个新对象（ bar ）并把它关联到我们指定的对象（ foo ），这样我们就可以充分发挥 [[Prototype]] 机制的威力（委托）并且避免不必要的麻烦（比如使用 new 的构造函数调用会生成 .prototype 和 .constructor 引用）。

Object.create(null) 会 创 建 一 个 拥 有 空（ 或 者 说 null ） [[Prototype]]
链接的对象，这个对象无法进行委托。由于这个对象没有原型链，所以
instanceof 操作符（之前解释过）无法进行判断，因此总是会返回 false 。
这些特殊的空 [[Prototype]] 对象通常被称作“字典”，它们完全不会受到原
型链的干扰，因此非常适合用来存储数据。

我们并不需要类来创建两个对象之间的关系，只需要通过委托来关联对象就足够了。而
Object.create(..) 不包含任何“类的诡计”，所以它可以完美地创建我们想要的关联关系。

Object.create(..) 是在 ES5 中新增的函数，所以在 ES5 之前的环境中（比如旧 IE）如
果要支持这个功能的话就需要使用一段简单的 polyfill 代码，它部分实现了 Object.
create(..) 的功能：

~~~js
if (!Object.create) {
  Object.create = function(o) {
    function F(){}
    F.prototype = o;
    return new F();
  };
}
~~~

标准 ES5 中内置的 Object.create(..) 函数还提供了一系列附加功能，但是 ES5 之前的版本不支持这些功能。

~~~js
var anotherObject = {
  a:2
};
var myObject = Object.create( anotherObject, {
  b: {
  enumerable: false,
  writable: true,
  configurable: false,
  value: 3
  },
  c: {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 4
  }
});
myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
myObject.hasOwnProperty( "c" ); // true
myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
~~~

---

## 第六章 行为委托

### 面向委托的设计

#### 类理论

类的设计方式可能是这样的： 定义一个父类，将通用的行为都定义在父类中，然后用子类去继承父类，并且在子类中进行特殊行为的处理，类的设计模式鼓励在继承的时候进行重写。

#### 委托的理论

不需要将通用的行为内容放到一起，可以分别在放两个对象中，需要的时候直接进行委托。

#### 互相委托
如果你引用了一个两边都不存在的属性或者方法，那就会在 [[Prototype]] 链上产生一个无限递归的循环。

但是如果所有的引用都被严格限制的话， B 是可以委托 A 的，反之亦然。因此，互相委托
理论上是可以正常工作的，在某些情况下这是非常有用的。

行为委托认为对象之间是兄弟关系，互相委托，而不是父类和子类的关系。JavaScript 的
[[Prototype]] 机制本质上就是行为委托机制。


