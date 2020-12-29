---
title: 笔记摘录-你不知道的JavaScript-中篇
img: 'https://placem.at/places?h=140'
date: '2018-02-25'
---

# toc

# 第一部分 类型和语法
## 第一章 类型

要正确合理地进行类型转换（参见第 4 章），我们必须掌握 JavaScript 中的各个类型及其内在行为。几乎所有的 JavaScript 程序都会涉及某种形式的强制类型转换，处理这些情况时
我们需要有充分的把握和自信。

### 内置类型

上卷第二部分对象一章提到JavaScript的类型有6种，然而这里提到了7种：
* 空值(null)
* 未定义(undefined)
* 布尔值(boolean)
* 数字(number)
* 字符串(string)
* 对象(object)
* 符号(symbol, ES6 新增)

> 除对象之外，其他统称为“基本类型”。

我们可以使用 typeof 运算符来查看值的类型：

~~~js
typeof undefined === "undefined"; // true
typeof true === "boolean"; // true
typeof 42 === "number"; // true
typeof "42" === "string"; // true
typeof { life: 42 } === "object"; // true
// ES6中新加入的类型
typeof Symbol() === "symbol"; // true
~~~

以上6种类型都有相应的字符串值与之相呼应，但是不包括 null

~~~js
typeof null === 'object'
~~~

正确的返回结果应该是 "null" ，但这个 bug 由来已久，在 JavaScript 中已经存在了将近
二十年，也许永远也不会修复，因为这牵涉到太多的 Web 系统，“修复”它会产生更多的
bug，令许多系统无法正常工作。

我们需要复合条件来检测 null：
~~~js
(!null && null === 'object')
~~~

还有一种情况：

~~~js
typeof function a(){ /* .. */ } === "function"; // true
~~~
function （函数）也是 JavaScript 的一个内置类型。然而查阅规范就会知道，
它实际上是 object 的一个“子类型”。具体来说，函数是“可调用对象”，它有一个内部属
性 [[Call]] ，该属性使其可以被调用。

函数不仅是对象，还可以拥有属性：
~~~js
function foo (a, b) {/.../}
foo.length // 2
~~~
函数的 length 属性值是其参数的个数

让我们看看数组：
~~~js
typeof [1,2,3] === 'object' //true
~~~

数组也是对象。确切地说，它也是 object 的一个“子类型”（参见第 3 章），数组的
元素按数字顺序来进行索引（而非普通像对象那样通过字符串键值），其 length 属性是元
素的个数。

### 值和类型

**JavaScript 的变量是没有类型的，只有值才有。变量可以持有任何类型的值。**

换个角度来理解就是，JavaScript 不做“类型强制”；也就是说，语言引擎不要求变量总是
持有与其初始值同类型的值。一个变量可以现在被赋值为字符串类型值，随后又被赋值为
数字类型值。

### undefined 和 undeclared

变量在未持有值的时候是 undefined。

在作用域中未声明变量时未 undeclared

~~~js
var a;
a; // undefined
b; // ReferenceError: b is not defined
~~~
通常变量在未定义的情况下使用会报 is not defined 的错误，但是有时候却不是，但是 typeof 的处理方式却不是这样：
~~~js
var a ;
typeof a // undefined
typeof b // undefined
~~~
对于 undeclared（或者 not defined）变量， typeof 照样返回 "undefined" 。请注意虽然 b 是
一个 undeclared 变量，但 typeof b 并没有报错。这是因为 typeof 有一个特殊的安全防范机制。

之前在上卷中也提到一个问题，对象取值的时候有可能返回 undefined，但是我们也不能根据 undefined 来判断，对象是因为不存在这个属性还是对象属性值为 undefined.

#### typeOf Undeclared

typeOf 这种防范机制在某些情况下是十分有作用的，比如判断全局的变量是否存在：
~~~js
// 这样判断会报错，会中断代码
if (DEBUG) {...}
// 但是换成 typeOf 来判断是安全的，不存在的时候只会抛出一个 undefined 
if (typeOf DEBUG !== undefined) {...}
~~~

当然你也可以这样写，可以不通过 typeOf:
~~~js
if (window.DEBUG) {
// ..
}
if (!window.atob) {
// ..
}
~~~
因为访问属性，就算不存在这个属性也会返回 undefined

---

## 值
### 数组
和其他强类型语言不同，在 JavaScript 中，数组可以容纳任何类型的值，可以是字符串、
数字、对象（ object ），甚至是其他数组（多维数组就是通过这种方式来实现的）

对数组声明后即可向其中加入值，不需要预先设定大小

~~~js
var a = [ ];
a.length; // 0
a[0] = 1;
a[1] = "2";
a[2] = [ 3 ];
a.length; // 3
~~~

使用 delete 运算符可以将单元从数组中删除，但是请注意，单元删除后，数
组的 length 属性并不会发生变化。第 5 章将详细介绍 delete 运算符。

数组是通过数字进行索引，但是数组也是对象，所以也可以包含字符串键值和属性

~~~js
var arr = []
arr['foo'] = 2
arr.length // 0
arr['12'] = 2
arr.length // 13
arr // [empty X 12, 2, foo: 2]
~~~
用字符串键值对存储，数组的 length 不会产生变化，但是需要注意的是，字符串如果被强制转换成十进制的话，它会被当成数字索引来处理，所以上边的 arr['12']就被当初了 arr[12]，所以，数组的length 变化为13

### 类数组
例如一些 dom 查询会返回 dom 元素列表，或者是 arguments 对象访问函数的参数列表，它们不是正在意义上的数组，但是与数组十分类似。通过工具函数可以将这些类数组转换成真正的数组。

工具函数 slice 经常被用于这类转换：

~~~js
function foo() {
  var arr = Array.prototype.slice(arguments)
  arr.push('bam)
  console.log(arr)
}
foo('bar', 'baz') // ['bar', 'baz', 'bam']
~~~

用 ES6 中的内置工具函数 Array.from(..) 也能实现同样的功能：

~~~js
var arr = Array.from( arguments );
~~~
> Array.from(..) 有一些非常强大的功能，将在本系列的《你不知道的JavaScript（下卷）》的“ES6 & Beyond”部分详细介绍。

### 字符串

字符串经常被当成字符数组。字符串的内部实现究竟有没有使用数组并不好说，但
JavaScript 中的字符串和字符数组并不是一回事，最多只是看上去相似而已。

字符串和数组的确很相似，它们都是类数组，都有 length 属性以及 indexOf(..) （从 ES5
开始数组支持此方法）和 concat(..) 方法：

~~~js
var a = "foo";
var b = ["f","o","o"];

a.length; // 3
b.length; // 3

a.indexOf( "o" ); // 1
b.indexOf( "o" ); // 1
var c = a.concat( "bar" ); // "foobar"
var d = b.concat( ["b","a","r"] ); // ["f","o","o","b","a","r"]
a === c; // false
b === d; // false
a; // "foo"
b; // ["f","o","o"]
~~~

但这并不意味着它们都是“字符数组”，比如：
~~~js
a[1] = "O";
b[1] = "O";
a; // "foo"
b; // ["f","O","o"]
~~~
JavaScript 中的字符串是不可变的，但是数组是可变的。

字符串不可变是指字符串的成员函数不会改变字符串的原始值，而是创建并且返回一个新的字符串。而数组的成员函数都是在其原始值进行操作的。

~~~js
c = a.toUpperCase();
a === c; // false
a; // "foo"
c; // "FOO"
b.push( "!" );
b; // ["f","O","o","!"]
~~~

许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数
组的非变更方法来处理字符串：
~~~js
a.join // undefined
a.map // undefined

var c = Array.prototype.join(a, '-') // f-o-o
var d = Array.prototype.map(a, (v) => {
  return v.toUpperCase() + '.'
}).join('') // F.O.O
~~~
数组有一个成员函数 reverse()，这个函数目前无法借用，想要进行字符串的反转，可以先将字符串转换成数组：
~~~js
var c = a.split('').reverse().join('')
~~~

### 数字

JavaScript 只有一种数字类型：number（数字），包括“整数”和带小数的十进制数。“整数”之所以加引号是因为和其他语言不同，JavaScript 没有真正意义上的整数，这也是
它一直以来为人诟病的地方。这种情况在将来或许会有所改观，但目前只有数字类型。
JavaScript 中的“整数”就是没有小数的十进制数。

#### 数字的语法

JavaScript 中的数字常量一般用十进制来表示。
~~~js
var a = 42
var b = 42.3
~~~
数字前面的 0 和 小数点后小数部分后面的 0 可以去掉
~~~js
var a = 0.32
var a = .32

var a = 43.0
var a = 43
~~~
特别大和特别小的数字默认用指数格式显示，与 toExponential() 函数的输出结果相同。
~~~js
var a = 5E10;
a; // 50000000000
a.toExponential(); // "5e+10"
var b = a * a;
b; // 2.5e+21
var c = 1 / a;
c; // 2e-11
~~~
tofixed(..) 方法可指定小数部分的显示位数：
~~~js
var a = 42.59;
a.toFixed( 0 ); // "43"
a.toFixed( 1 ); // "42.6"
a.toFixed( 2 ); // "42.59"
a.toFixed( 3 ); // "42.590"
a.toFixed( 4 ); // "42.5900"
~~~
toPrecision(..) 方法用来指定有效数位的显示位数：
~~~js
var a = 42.59;
a.toPrecision( 1 ); // "4e+1"
a.toPrecision( 2 ); // "43"
a.toPrecision( 3 ); // "42.6"
a.toPrecision( 4 ); // "42.59"
a.toPrecision( 5 ); // "42.590"
a.toPrecision( 6 ); // "42.5900"
~~~
上面的方法不仅适用于数字变量，也适用于数字常量。不过对于 . 运算符需要给予特别注
意，因为它是一个有效的数字字符，会被优先识别为数字常量的一部分，然后才是对象属
性访问运算符。

~~~js
// 无效语法：
42.toFixed( 3 ); // SyntaxError
// 下面的语法都有效：
(42).toFixed( 3 ); // "42.000"
0.42.toFixed( 3 ); // "0.420"
42..toFixed( 3 ); // "42.000"
~~~
42.tofixed(3) 是无效语法，因为 . 被视为常量 42. 的一部分（如前所述），所以没有 . 属性访问运算符来调用 tofixed 方法。
42..tofixed(3) 则没有问题，因为第一个 . 被视为 number 的一部分，第二个 . 是属性访问运算符。只是这样看着奇怪，实际情况中也很少见。在基本类型值上直接调用的方法并不
多见，不过这并不代表不好或不对。

#### 较小的数值
二进制浮点数最大的问题（不仅 JavaScript，所有遵循 IEEE 754 规范的语言都是如此），是会出现如下情况：
~~~js
0.1 + 0.2 === 0.3; // false
~~~
从数学角度来说，上面的条件判断应该为 true ，可结果为什么是 false 呢？
简单来说，二进制浮点数中的 0.1 和 0.2 并不是十分精确，它们相加的结果并非刚好等于
0.3 ，而是一个比较接近的数字 0.30000000000000004 ，所以条件判断结果为 false 。

那么应该怎样来判断 0.1 + 0.2 和 0.3 是否相等呢？
最常见的方法是设置一个误差范围值，通常称为“机器精度”（machine epsilon），对
JavaScript 的数字来说，这个值通常是 2^-52 (2.220446049250313e-16) 。

从 ES6 开始，这个值就定义在Number.EPSILON中，我们可以直接使用，也可以用 polyfill:
~~~js
if (!Number.EPSILON) {
  Number.EPSILON = Math.pow(2,-52);
}

function numbersCloseEnoughToEqual(n1,n2) {
  return Math.abs( n1 - n2 ) < Number.EPSILON;
}
var a = 0.1 + 0.2;
var b = 0.3;
numbersCloseEnoughToEqual( a, b ); // true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 ); // false
~~~
能够呈现的最大浮点数大约是 1.798e+308 （这是一个相当大的数字），它定义在 Number.
MAX_VALUE 中。最小浮点数定义在 Number.MIN_VALUE 中，大约是 5e-324 ，它不是负数，但无限接近于 0 ！

#### 整数的安全范围

能够被“安全”呈现的最大整数是 2^53 - 1 ，即 9007199254740991 ，在 ES6 中被定义为
Number.MAX_SAFE_INTEGER 。最小整数是 -9007199254740991 ，在 ES6 中被定义为 Number.MIN_SAFE_INTEGER 。

有时 JavaScript 程序需要处理一些比较大的数字，如数据库中的 64 位 ID 等。由于
JavaScript 的数字类型无法精确呈现 64 位数值，所以必须将它们保存（转换）为字符串。
好在大数值操作并不常见（它们的比较操作可以通过字符串来实现）。如果确实需要对大
数值进行数学运算，目前还是需要借助相关的工具库。将来 JavaScript 也许会加入对大数
值的支持。

#### 整数检测

要检测一个数字是否为整数，可以使用 ES6 的 Number.isInterger(...)

~~~js
Number.isInteger( 42 ); // true
Number.isInteger( 42.000 ); // true
Number.isInteger( 42.3 ); // false
~~~

也可以为 ES6 之前的版本 polyfill  Number.isInteger(..) 方法：
~~~js
if (!Number.isInteger) {
  Number.isInteger = function(num) {
    return typeof num == "number" && num % 1 == 0;
  };
}
~~~
要检测一个值是否是安全的整数，可以使用 ES6 中的 Number.isSafeInteger(..) 方法：
~~~js
Number.isSafeInteger( Number.MAX_SAFE_INTEGER ); // true
Number.isSafeInteger( Math.pow( 2, 53 ) ); // false
Number.isSafeInteger( Math.pow( 2, 53 ) - 1 ); // true
~~~
可以为 ES6 之前的版本 polyfill  Number.isSafeInteger(..) 方法：
~~~js
if (!Number.isSafeInteger) {
  Number.isSafeInteger = function(num) {
    return Number.isInteger( num ) &&
    Math.abs( num ) <= Number.MAX_SAFE_INTEGER;
  };
}
~~~

### 特殊数值

JavaScript的数据类型中有几个特殊的值需要开发人员特别注意和小心使用

#### 不是值的值

undefined 类型只有一个值，即 undefined。null类型也只有一个值，即 null。它们的名称既是类型也是值。

undefined 和 null 通常被用来表示“空的”或者“不是值”的值，二者之间有一些细微的差别：

* null 指空值
* undefined 指没有值

或者

* undefined 指从没有赋过值
* null 指曾赋过值，但是目前没有值

null 是一个特殊的关键字，不是标识符，我们不能将其当作变量来使用和赋值，然而，undefined 却是一个标识符，可以被当作变量来使用和赋值

#### undefined
非严格模式下，我们可以为全局的标识符 undefined 赋值。
~~~js
function foo () {
  undefined = 2
}
foo () 
function foo(){
  "use strict";
  undefined = 2 // TypeError
}
foo()
~~~
#### void 运算符
undefined 是一个内置标识符（除非被重新定义，见前面的介绍）它的值为 undefined，通过 void 运算符即可得到该值。

~~~js
var a = 42
console.log(vaid a, a) // undefined 42
~~~
按照惯例我们使用 void 0 来获得 undefined 。void 0 void 1 和 undefined 之间并没有实质的区别

此外，void 还可不让表达式返回任何结果

~~~js
function doSomething() {
  if (!APP.ready) {
    return void setTimeout(doSomething, 100)
  }
  var result 
  return result
}
if (doSomething) {
  // 立即执行下一个任务
~~~
很多的开发人员喜欢分开操作：
~~~js
if (!APP.ready) {
  setTimeout(doSomething, 100)
  return 
}
~~~

#### 特殊的数字

如果数学运算符的操作数不是数字类型，就无法返回一个有效的数字，这种情况下返回值为 NaN

NaN 指“不是一个数字”，我们可以将它理解为“无效的数值”“失败的数值”“坏数值”
~~~js
var a = 2 / 'foo' // NaN
typeof NaN // number
~~~
换句话来说，“不是数字的数字：仍然是数字类型。
~~~js
var a = 2 / 'foo' // NaN
a === NaN // false
isNaN(a) // true
~~~
NaN 是一个特殊值，他是JavaScript中唯一一个不等于自身的值。我们通常通过一个全局函数 isNaN(...) 来判断一个值是不是 NaN。

然而，isNaN(...)有一个严重的缺陷，上边我们说了 NaN 的类型还是一个数字类型：
~~~js
var b  = 'foo'
isNaN(b) // true
~~~
显然 b 是一个字符串不是一个数字类型，所以不能是NaN，这个bug自JavaScript来一直存在。

从 ES6 开始我们可以使用工具函数 Number.isNaN(...)。在 ES6 之前我们可以使用浏览器的 polyfill：
~~~js
if (!Number.isNaN) {
  Number.isNaN = function (n) {
    return {
      typeof n === 'number' && window.isNaN(n)
    }
  }
}
~~~

我们也可以利用 NaN 是JavaScript中唯一一个不等于自身的特点来写这个 polyfill:
~~~js
if (!Number.isNaN) {
  Number.isNaN = function (n) {
    return n ! == n
  }
}
~~~
#### 无穷数
~~~js
var a = 1 / 0 //Infinity
var b = -1 / 0 // -Infinity
~~~
Infinity 即 Number.POSITIVE_INFINITY
-Infinity 即 Number.NAGATIVE_INFINITY

#### 零值

~~~js
var a = 0 / -3 // -0
var a = 0 * -3 // -0
~~~
javaScript 中的除法和乘法会得到 -0，但是加法和减法不会得到 -0.
~~~js
var a = -0
a.toString() // '0'
a + '' // '0'
JSON.stringify(a) // '0'
~~~
我们将 -0 转换为字符串可以得到字符串 '0'
~~~js
+ '-0'; //-0
Number('-0') // -0
JSON.parse('-0') // -0
~~~

~~~js
-0 === 0 //true
-0 > 0 //false
~~~
如何区分 0 和 -0
~~~js
function isNegZero(n) {
  n = Number(n)
  return (n === 0) && (1/n === -Infinity)
}
~~~

#### 特殊等式
如前面所述，NaN 和 -0 在相等比较的时候比较特别，所以，需要借助 Number.isNaN(...)或者是isNegZero(...) 这样的工具函数来比较。

ES6 中加入了一个新的方法 Object.is(...) 来判断两个值是否绝对相等。
~~~js
var a = 2 / 'foo'
var b = -3 * 0
Object.is(a, NaN) // true
Object.is(b, -0) // true
Object.is(b, 0) // true
~~~

对于 ES6 之前的版本，Object.is(...) 有一个简单的polyfill:
~~~js
if (!Object.is) {
  Object.is = function (v1, v2) {
    // 判断是否是 -0
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 ==== 1 / v2
    }
    // 判断是否是NaN
    if (v1 !== v2) {
      return v2 !== v2
    }
    return v1 === v2
  }
}
~~~
> 能使用 == 和 === 就不要使用 Object.is(...) 因为前者的效率比较高。

### 值和引用

JavaScript对值和引用的赋值/船体在语法上没有区别，完全根据值的类型来决定。
~~~js
var a = 2
var b = a // b 是 a 的副本
b++
a // 2
b // 3

var c = [1,2,3]
var d = c
d.push(4)
c // [1,2,3,4]
d // [1,2,3,4]
~~~

**简单值（即是标量基本类型值）总是通过值复制的方式来赋值/传递，包括null, undefined,字符串，数字，布尔值和ES6中symbol**

**复合值---对象（包括组装和封装对象）和函数，则总通过引用扶植的方式来赋值/传递**

由于引用指向的是值本身而并非变量，所以一个引用无法更改另一个引用的指向。
~~~js
var a = [1,2,3]
var b = a
a // [1,2,3]
b // [1,2,3]

b = [4,5,6]
a // [1,2,3]
b // [4,5,6]
~~~

函数参数就经常让人产生这样的困惑：
~~~js
function foo(x) {
  x.push(4)
  x // [1,2,3,4]

  x = [4,5,6]
  x.push(7)
  x // [4,5,6,7]
}
var a = [1,2,3]
foo(a)
a // [1,2,3,4] 而不是 [4,5,6,7]
~~~

> 我们无法决定使用值复制还是引用复制，一切由值的类型来决定。

如果通过值赋值的方式来传递复合值，就需要为它创建一个复本。

如： foo(a.slice())，slice(...)能返回当前数组的一个浅复本。

相反的如果要将标量的基本类型值传递到函数内并进行更改，就需要将该值封装到一个复合值中，然后通过引用复制的方式进行传递。
~~~js
function foo(wrapper) {
  wrapper.a = 42
}
var obj = {
  a: 2
}
foo(obj) 
obj.a // 42
~~~

那是不是需要传递指向标量的基本类型值的引用，就可以将其风转告对应的对象中。
~~~js
function foo(x) {
  x = x + 1
  x //3
}
var a = 2
var b = new Number(a)
foo(b)
console.log(b) // 是 2，不是 3
~~~

原因是标量基本类型值是不可变的。

---

## 原生函数

常用的原生函数：
* String()
* Number()
* Boolean()
* Array()
* Object()
* Function()
* RegExp()
* Date()
* Error()
* Symbol() ---- ES6 新加入

原生函数可以当作构造函数来使用，但是其构造出来的对象可能会和我们设想的所有出入：

~~~js
var a = new String('abc')
typeof a // object
a instanceof String // true
Object.prototype.toString.call(a) //[object, String]
~~~
typeof 在这里返回的是对象的子类型

### 内部属性

所有 typeof 返回值为"object"的对象都包含一个内部属性，这个属性我们无法访问，一般通过Object.prototype.toString(...)来查看。

### 封装对象包装

封装对象扮演着十分重要的角色。由于基本类型值没有.length 和 .toString() 这样的属性和方法，需要通过风转对象才能访问，此时 JavaScript自动为基本类型值包装一个封装对象。

~~~js
var a = 'atbc'
a.length // 3
a.toUpperCase() // 'ABC'
~~~

#### 封装对象释疑
使用封装对象时有些地方需要特别注意

比如Boolean:
~~~js
var a = new Boolean(false)
if (!a) {
  console.log('Oops') // 执行不到这里
}
~~~

想要自行封装基本类型值，可以使用Object(...) 函数
~~~js
var a = 'abc'
var b = new String(a)
var c = Object(a)
typeof a // string
typeof b // object
typeof c // object

b instanceof String // true
c instanceof String // true

Object.prototype.toString.call(b) // '[object String]'
Object.prototype.toString.call(c) // '[object String]'
~~~
**一般不推荐世界使用封装对象**

### 拆封
如果需要得到封装中的基本类型值，可以使用 valueOf() 函数

~~~js
var a = new String('abc')
var b = new Number(42)
var c = new Boolean(true)

a.valueOf() // 'abc'
b.valueOf() // 42
c.valueOf() // true
~~~

在需要用到封装对象的基本类型值的地方会发生隐式拆封，即强制类型转换。在第四章当中会介绍。

### 将原生函数作为构造函数

关于数组（Array）、对象（Object）、函数（function）和正则表达式，我们通常喜欢以常量的形式来创建它们，效果实际上和使用构造函数是一样的，除非十分必要，否则不要使用构造函数。

#### Array(...)

~~~js
var a = new Array(1,2,3)
var b = Array(1,2,3)
a // [1,2,3]
b // [1,2,3]
~~~

构造函数Array(...)不要求必须 new 关键字，不带时，它会自动补上。

Array 构造函数只带一个数字参数时，该参数会被认为数组的长度来处理，而非只充当数组中的一个元素。

#### Object(...)、Function(...) 、和 RegExp(...)

#### Date(...) 和 Errro(...)

相对于其他的原生构造函数，Date(...)和Error(...)的用处要大很多，因为没有对应的常量形式来作为它们的代替。

创建日期对象必须使用 new Date(...)。Date(...)可以带参数，用来指定日期和时间，而不带参数的话则使用当前的日期和时间。

Date(...)主要用来获得当前的Unix时间戳（从1970年1月1日开始计算，以秒为单位。该值可以通过日期对象的getTime()来获得。

从 ES5 开始引入一个更简单的方法，Date.now()。对于ES5之前的版本可以使用：
~~~js
if (!Date.now) {
  Date.now = function () {
    return (new Date()).getTime()
  }
}
~~~

构造函数 Error(...)带不带 new 关键字都可以

错误对象只要是为了获得当前运行栈上下文。栈上下文信息包括函数调用栈信息和产生的错误代码行号，以便调式。

~~~js
function foo(x) {
  if (!x) {
    throw new Error("x wasn't provided")
  }
}
~~~

通常错误对象至少包含一个message属性。

除了 Error(...)之外，还有一些针对特定错误类型的原生构造函数，如：
EvalError(...)、RangeError(...)、ReferenceError(...)、SyntaxError(...)
、TypeError(...)和URIError(...)。这些构造函数很少使用，它们在程序发生异常时会被自动调用。

#### Symbol(...)

ES6 中新加入的有一个基本数据类型---符号。符号属性具有唯一性的特殊性（并非绝对），用它来命名对象属性不容易导致重名。

~~~js
var mysym = Symbol('my own symbo')
mysym // Symbol(my own symbol)
mysym.toString() // 'Symbol(my own symbol)'
typeof mysm // symbol

var a = {}
a[mysym] = 'foobar'

Object.getOwnPropertySymbols(a)
// [Symbol(my own symbol)]
~~~

Object.getOwnPropertySymbos(...)可以公开获得对象中的所有符号。符号通常用域私有属性。

---

## 第四章 强制类型转换

### 值类型转换
将值从一种类型转换为另一种类型通常称为类型转换，这是显示的情况，隐式的情况称为强制类型转换。

### 抽象值操作
介绍隐式和显示强制类型转换之前，我们需要掌握字符串、数字和布尔值之间的类型转换的规则。

#### toString()
* 基本值类型的字符串转换规则为：null 转换为 "null",undefined转换为"undefined",true转换为"true",数字的字符串遵循通用规则，不过第2章中讲过的那些极小和极大的数字使用指数形式：
~~~js
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000
a.toString() // "1.07e21"
~~~

* 对于普通对象来讲，除非自行定义，否则toString()(Object.prototype.toString())返回内部属性[[Class]]的值。
然而我们在前面讲过，如果对象由中级的toString()方法，字符串化时就会调用该方法并且使用其返回值。

* 数组的默认toString() 方法经过了重新定义，将所有的单元字符串化后再用","连接起来：
~~~js
var a = [1,2,3]
a.toString() // '1,2,3'
~~~

##### JSON字符串化
工具函数JSON.stringify(...)在将JSON对象序列化为字符串时也用到了ToString

> 请注意，JSON字符串化并非严格意义上的强制类型转换，以为其中也涉及到ToString的相关规则。

* 对于大多数简单值，JSON字符串化和toString()的效果基本相同，只不过序列化的结果总是字符串：
~~~js
JSON.stringify(42) // '42'
JSON.stringify('42')// '42'
JSON.stringify(null)// 'null'
JSON.stringify(true) // 'true'
~~~
所有的安全的JSON值都可以使用JSON.stringify(...)字符串化。安全值是指可以呈现为有效JSON的值。

哪些是不安全的值：undefined、function、symbol和包含循环引用的对象都不符合JSON结构标准。

JSON.stringify(...) 在对象中遇到undefined、function和symbol时会自动将其忽略，在数组中会返回null（以保证单元位置不变）
~~~js
JSON.stringify(undefined) // undefined
JSON.stringify(function(){}) // undefined
JSON.stringify(
  [1, undefined, function(){}, 4]
) // "[1, null, null, 4]"
JSON.stringify(
  { a: 2, b: function(){} }
) // "{"a": 2}"
~~~
对包含循环引用的对象执行JSON.stringify(...)会报错

如果对象中定义了toJSON()方法，JSON字符串化时会首先调用该方法，然后用它的返回值来序列化。

如果要对含非法JSON值的对象做字符串化，或者对象中的某些值无法被序列化，就需要定义JSON()方法来返回一个安全的JSON值。

~~~js
var o = { };
var a = {
  b: 42,
  c: o,
  d: function(){}
};
// 在a中创建一个循环引用
o.e = a;
// 循环引用在这里会产生错误
// JSON.stringify( a );
// 自定义的JSON序列化
a.toJSON = function() {
// 序列化仅包含b
  return { b: this.b };
};
JSON.stringify( a ); // "{"b":42}"
~~~
很多人误认为toJSON返回的是JSON字符串化后的值，其实不是，toJSON()的返回值应该是一个适当的值，可以是任何类型，然后再用JSON.stringify(...)进行格式化。

我们可以向JSON.stringify(...)中传递一个可选择参数replacer，他可以是数组或者函数，用来指定对象序列化过程中，哪些属性应该被处理哪些应该被排除。

* 如果replacer是一个数组，那么它必须是一个字符串数组，其中包含要被处理的对象属性名称。
* 如果replacer是一个函数，它会对对象本身调用一次，然后对对象中的每个属性各调用一次，每次传递两个参数，键和值。如果要忽略某个键就返回 undefined ，否则返回指定的值。
~~~js
var a = {
  b: 42,
  c: "42",
  d: [1,2,3]
};
JSON.stringify( a, ["b","c"] ); // "{"b":42,"c":"42"}"
JSON.stringify( a, function(k,v){
  if (k !== "c") return v;
} );
// "{"b":42,"d":[1,2,3]}"
~~~

请记住， JSON.stringify(..) 并不是强制类型转换。在这里介绍是因为它涉及 ToString 强
制类型转换，具体表现在以下两点。

(1) 字符串、数字、布尔值和 null 的 JSON.stringify(..) 规则与 ToString 基本相同。

(2) 如果传递给 JSON.stringify(..) 的对象中定义了 toJSON() 方法，那么该方法会在字符
串化前调用，以便将对象转换为安全的 JSON 值。

#### ToNumber

有时我们需要将非数字值当作数字来使用，比如数学运算。为此 ES5 规范在 9.3 节定义了
抽象操作 ToNumber 。

其中 true 转换为 1 ， false 转换为 0 。 undefined 转换为 NaN ， null 转换为 0 。

对象（包括数组）会首先被转换为相应的基本类型值，如果返回的是非数字的基本类型值，则再遵循以上规则将其强制转换为数字。

为了将值转换为相应的基本类型值，抽象操作toPrimitive会首先检查该值是否有valueOf(...)方法。如果有并且返回基本类型值，就用该值进行强制转换，如果没有就是用toString(...)的返回值来进行强制的类型转换。

如果 valueOf() 和 toString() 均不返回基本类型值，会产生 TypeError 错误。

从 ES5 开始，使用 Object.create(null) 创建的对象 [[Prototype]] 属性为 null ，并且没
有 valueOf() 和 toString() 方法，因此无法进行强制类型转换。
~~~js
var a = {
  valueOf: function(){
  return "42";
  }
};
var b = {
  toString: function(){
  return "42";
  }
};
var c = [4,2];
  c.toString = function(){
  return this.join( "" ); // "42"
};
Number( a ); // 42
Number( b ); // 42
Number( c ); // 42
Number( "" ); // 0
Number( [] ); // 0
Number( [ "abc" ] ); // NaN
~~~

#### ToBoolean

##### 假值
我们再来看看其他值是如何被强制类型转换为布尔值的。

JavaScript 中的值可以分为以下两类：

(1) 可以被强制类型转换为 false 的值

(2) 其他（被强制类型转换为 true 的值）

以下这些是假值：

* undefined
* null
* false
* +0 -0和NaN
* ''

假值的布尔强制类型转换结果为 false 。

从逻辑上说，假值列表以外的都应该是真值（truthy）。但 JavaScript 规范对此并没有明确
定义，只是给出了一些示例，例如规定所有的对象都是真值，我们可以理解为假值列表以
外的值都是真值。
~~~js
var a = new Boolean( false );
var b = new Number( 0 );
var c = new String( "" );
var d = Boolean( a && b && c );
d; // true
~~~

##### 真值
不在假值列表的值叫真值。
~~~js
var a = "false";
var b = "0";
var c = "''";
var d = Boolean( a && b && c );
d; // true

var a = []; // 空数组——是真值还是假值？
var b = {}; // 空对象——是真值还是假值？
var c = function(){}; // 空函数——是真值还是假值？
var d = Boolean( a && b && c );
d; // true
~~~

### 显示强制类型转换

#### 字符串和数字之间的显示转换

字符串和数字之间的转换是通过String(...)和Number(...)这两个内建函数来实现的。

请注意它们前面没有 new 关键字，并不创建封装对象。

~~~js
var a = 42;
var b = String( a );
var c = "3.14";
var d = Number( c );
b; // "42"
d; // 3.14
~~~

String(..) 遵循前面讲过的 ToString 规则，将值转换为字符串基本类型。 Number(..) 遵循
前面讲过的 ToNumber 规则，将值转换为数字基本类型。

除了String(...)和Number(...)，还有其他可以实现字符串和数字之间显示转换的方法：
~~~js
var a = 42;
var b = a.toString();
var c = "3.14";
var d = +c;
b; // "42"
d; // 3.14
~~~

a.toString() 是显式的（“toString”意为“to a string”），不过其中涉及隐式转换。因为
toString() 对 42 这样的基本类型值不适用，所以 JavaScript 引擎会自动为 42 创建一个封
装对象（参见第 3 章），然后对该对象调用 toString() 。这里显式转换中含有隐式转换

上例中 +c 是 + 运算符的一元（unary）形式（即只有一个操作数）。 + 运算符显式地将 c 转
换为数字，而非数字加法运算（也不是字符串拼接，见下）。

d = +c(d =+ c) 和 d += c有天壤之别。

1. 日期显示转换为数字

一元运算符+的另一个用途是将日期（Date）对象强制转换为数字类型。返回结果为Unix的时间戳。
~~~js
var d = new Date( "Mon, 18 Aug 2014 08:53:06 CDT" );
+d; // 1408369986000
// 通常使用下面的方法来获取当前的时间戳
var timestamp = +new Date()
~~~

2. 奇特的~运算符

一个常被人忽视的地方是 ~ 运算符（即字位操作“非”）相关的强制类型转换

~x 大致等同于 -(x + 1)。
~~~js
~42; // -(42+1) ==> -43
~~~

在 -(x+1) 中唯一能够得到 0 （或者严格说是 -0 ）的 x 值是 -1 。也就是说如果 x 为 -1 时， ~和一些数字值在一起会返回假值 0 ，其他情况则返回真值。

-1是一个哨位值，通常在各个语言中都有特殊的含义。

比如JavaScript中的indexOf(...)函数。indexOf(..) 不仅能够得到子字符串的位置，还可以用来检查字符串中是否包含指定的子字符串，相当于一个条件判断。
~~~js
var a = "Hello World";
if (a.indexOf( "lo" ) >= 0) { // true
// 找到匹配！
}
if (a.indexOf( "lo" ) != -1) { // true
// 找到匹配！
}
if (a.indexOf( "ol" ) < 0) { // true
// 没有找到匹配！
}
if (a.indexOf( "ol" ) == -1) { // true
// 没有找到匹配！
}
~~~

**>= 0 和 == -1 这样的写法不是很好，称为“抽象渗漏”，意思是在代码中暴露了底层的实现细节，这里是指用 -1 作为失败时的返回值，这些细节应该被屏蔽掉。**

~~~js
var a = "Hello World";
~a.indexOf( "lo" ); // -4 <-- 真值!
if (~a.indexOf( "lo" )) { // true
// 找到匹配！
}
~a.indexOf( "ol" ); // 0 <-- 假值!
!~a.indexOf( "ol" ); // true
if (!~a.indexOf( "ol" )) { // true
// 没有找到匹配！
}
~~~
如果 indexOf(..) 返回 -1 ， ~ 将其转换为假值 0 ，其他情况一律转换为真值。

3. 字位截除
一些开发人员使用 ~~ 来截除数字值的小数部分，以为这和 Math.floor(..) 的效果一样，
实际上并非如此。
~~~js
Math.floor( -49.6 ); // -50
~~-49.6; // -49
~~~

#### 显示的解析数字字符串
解析字符串中的数字和强制转换字符串为数字返回的结果都是数字，但是解析和转换两者之间还是有差别的。

~~~js
var a = "42";
var b = "42px";
Number( a ); // 42
parseInt( a ); // 42
Number( b ); // NaN
parseInt( b ); // 42
~~~
解析允许字符串中含有非数字字符串，解析按照从左至右的顺序，如果遇到非数字字符串就会停止。而转换不允许包含非数字字符串，否则返回NaN。

> 解析字符串中的浮点数可以使用 parseFloat(..) 函数。

如何解释下面的返回结果？
~~~js
parseInt(1/0, 19) // 18
~~~
parseInt(..) 先将参数强制类型转换为字符串再进行解析（toString()），1/0 = Infinity，所以上边等同于parseInt('Infinity', 19)，19进制的表示 123456789ABCDEFGHIJ，parseInt解析到n的时候发现是无效的，所以只能到I，而I在19进制中表示18，所以最终的结果是18。

此外还有一些看起来奇怪但实际上解释得通的例子：
~~~js
parseInt( 0.000008 ); // 0 ("0" 来自于 "0.000008")
parseInt( 0.0000008 ); // 8 ("8" 来自于 "8e-7")
parseInt( false, 16 ); // 250 ("fa" 来自于 "false")
parseInt( parseInt, 16 ); // 15 ("f" 来自于 "function..")
parseInt( "0x10" ); // 16
parseInt( "103", 2 ); // 2
~~~

#### 显示的转换为布尔值

与前面的 String(..) 和 Number(..) 一样， Boolean(..) （不带 new ）是显式的 ToBoolean 强制类型转换：
~~~js
var a = "0";
var b = [];
var c = {};
var d = "";
var e = 0;
var f = null;
var g;
Boolean( a ); // true
Boolean( b ); // true
Boolean( c ); // true
Boolean( d ); // false
Boolean( e ); // false
Boolean( f ); // false
Boolean( g ); // false
~~~
和前面讲过的 + 类似，一元运算符 ! 显式地将值强制类型转换为布尔值。但是它同时还将
真值反转为假值（或者将假值反转为真值）。所以显式强制类型转换为布尔值最常用的方
法是 !! ，因为第二个 ! 会将结果反转回原值：
~~~js
var a = "0";
var b = [];
var c = {};
var d = "";
var e = 0;
var f = null;
var g;
!!a; // true
!!b; // true
!!c; // true
!!d; // false
!!e; // false
!!f; // false
!!g; // false
~~~

显式 ToBoolean 的另外一个用处，是在 JSON 序列化过程中将值强制类型转换为 true 或
false ：
~~~js
var a = [
  1,
  function(){ /*..*/ },
  2,
  function(){ /*..*/ }
];
JSON.stringify( a ); // "[1,null,2,null]"
JSON.stringify( a, function(key,val){
if (typeof val == "function") {
// 函数的ToBoolean强制类型转换
  return !!val;
}
else {
  return val;
}
} );
// "[1,true,2,true]"
~~~
### 隐式强制转换

#### 字符串和数字之间的隐式强制转换

~~~js
var a = "42";
var b = "0";
var c = 42;
var d = 0;
a + b; // "420"
c + d; // 42
~~~

因为某一个或者两个操作数都是字符串，所以 + 执行的是字符串拼接操作。

#### 布尔值到数字的隐式强制转换

~~~js
function onlyOne() {
  var sum = 0;
  for (var i=0; i < arguments.length; i++) {
  // 跳过假值，和处理0一样，但是避免了NaN
    if (arguments[i]) {
      sum += arguments[i];
    }
  }
  return sum == 1;
}
~~~

#### 隐式强制类型转换为布尔值

相对布尔值，数字和字符串操作中的隐式强制类型转换还算比较明显。下面的情况会发生
布尔值隐式强制类型转换。

(1)  if (..) 语句中的条件判断表达式。

(2)  for ( .. ; .. ; .. ) 语句中的条件判断表达式（第二个）。

(3)  while (..) 和 do..while(..) 循环中的条件判断表达式。

(4)  ? : 中的条件判断表达式。

(5) 逻辑运算符 || （逻辑或）和 && （逻辑与）左边的操作数（作为条件判断表达式）。

### || 和 &&

逻辑运算符 || （或）和 && （与）应该并不陌生，也许正因为如此有人觉得它们在
JavaScript 中的表现也和在其他语言中一样

这里面有一些非常重要但却不太为人所知的细微差别。

我其实不太赞同将它们称为“逻辑运算符”，因为这不太准确。称它们为“选择器运算符”（selector operators）或者“操作数选择器运算符”（operand selector operators）更恰当些。

为什么？因为和其他语言不同，在 JavaScript 中它们返回的并不是布尔值。

它们的返回值是两个操作数中的一个（且仅一个）。即选择两个操作数中的一个，然后返回它的值。
~~~js
var a = 42;
var b = "abc";
var c = null;
a || b; // 42
a && b; // "abc"
c || b; // "abc"
c && b; // null
~~~

对于 || 来说，如果条件判断结果为 true 就返回第一个操作数（ a 和 c ）的值，如果为
false 就返回第二个操作数（ b ）的值。
&& 则相反，如果条件判断结果为 true 就返回第二个操作数（ b ）的值，如果为 false 就返
回第一个操作数（ a 和 c ）的值。

#### 符号的强制类型转换

ES6 引入了符号类型，但是它的强制转换有个坑，这里有必要提一下：ES6 允许从符号到字符串的显示强制转换，然而，隐式强制转换会发生错误。
~~~js
var s1 = Symbol('cool')
String(s1) // 'Symbol(cool)'

var s2 = Symbol('cool')
s2 + '' // TypeError
~~~

### 宽松相等和严格相等

宽松相等（==）和严格相等（===）都用来判断两个值是否相等。但是他们两有个很重要的区别。
常见的误区是”==检查值是否相等，===检查值和类型是否想等“。这种解释不够正确。

正确的解释：”==允许相等比较中进行强制类型转换，而===不允许“

#### 相等比较操作的性能

根据第一种解释（不准确的版本）， === 似乎比 == 做的事情更多，因为它还要检查值的类型。

第二种解释中 == 的工作量更大一些，因为如果值的类型不同还需要进行强制类型转换。
有人觉得 == 会比 === 慢，实际上虽然强制类型转换确实要多花点时间，但仅仅是微秒级
（百万分之一秒）的差别而已。

如果进行比较的两个值类型相同，则 == 和 === 使用相同的算法，所以除了 JavaScript 引擎
实现上的细微差别之外，它们之间并没有什么不同。


如果两个值的类型不同，我们就需要考虑有没有强制类型转换的必要，有就用 == ，没有就用 
=== ，不用在乎性能。

### 抽象相等

* 字符串和数字之间的相等的比较

  - 如果type(x)是数字，type(y)是字符串，则返回 x == toNumber(y)的结果
  - 如果type(x)是字符串，type(y)是数字，则返回 toNumber(x) == y的结果
* 其他类型和布尔类型之间的相等比较

  - 如果 Type(x) 是布尔类型，则返回 ToNumber(x) == y 的结果
  - 如果 Type(y) 是布尔类型，则返回 x == ToNumber(y) 的结果
* null 和 undefined 之间的相等比较

  - 如果 x 为 null ， y 为 undefined ，则结果为 true 
  - 如果 x 为 undefined ， y 为 null ，则结果为 true
* 对象和非对象之间的相等比较

  - 如果 Type(x) 是字符串或数字， Type(y) 是对象，则返回 x == ToPrimitive(y)
的结果
  - 如果 Type(x) 是对象， Type(y) 是字符串或数字，则返回 ToPromitive(x) == y
的结果

#### 比较少见的情况

~~~js
"0" == null; // false
"0" == undefined; // false
"0" == false; // true -- 晕！
"0" == NaN; // false
"0" == 0; // true
"0" == ""; // false
false == null; // false
false == undefined; // false
false == NaN; // false
false == 0; // true -- 晕！
false == ""; // true -- 晕！
false == []; // true -- 晕！
false == {}; // false
"" == null; // false
"" == undefined; // false
"" == NaN; // false
"" == 0; // true -- 晕！
"" == []; // true -- 晕！
"" == {}; // false
0 == null; // false
0 == undefined; // false
0 == NaN; // false
0 == []; // true -- 晕！
0 == {}; // false
~~~

#### 抽象关系比较
~~~js
var a = { b: 42 };
var b = { b: 43 };
a < b; // false
a == b; // false
a > b; // false
a <= b; // true
a >= b; // true
~~~
---
## 第五章 语法
### 语句和表达式
#### 代码块

~~~js
[] + {}; // "[object Object]"
{} + []; // 0
~~~

第一行代码中， {} 出现在 + 运算符表达式中，因此它被当作一个值（空对象）来处理。第
4 章讲过 [] 会被强制类型转换为 "" ，而 {} 会被强制类型转换为 "[object Object]" 。

但在第二行代码中， {} 被当作一个独立的空代码块（不执行任何操作）。代码块结尾不需
要分号，所以这里不存在语法上的问题。最后 + [] 将 [] 显式强制类型转换（参见第 4 章）
为 0 。

### 运算符的优先级

~~~js
var a = 42, b;
b = ( a++, a );
a; // 43
b; // 43

var a = 42, b;
b = a++, a;
a; // 43
b; // 42
~~~

运算符的优先级比 = (等号) 低，可以认为 (b = a++)，a

~~~js
true || false && false; // true
(true || false) && false; // false
true || (false && false); // true
~~~

&& 先执行，然后是 || 。

mdn 上的运算符优先级列表

[https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

### 自动分号

有时JavaScript会为代码行补上缺失的分号，即自动分号插入（Automatic Semicolon Insertion, ASI）

**请注意，ASI 只在换行符处起作用，而不会在代码行的中间插入分号。**


ES5-Shim（https://github.com/es-shims/es5-shim）是一个完整的 shim/polyfill
集合，能够为你的项目提供 ES5 基本规范支持。同样，ES6-Shim（https://
github.com/es-shims/es6-shim）提供了对 ES6 基本规范的支持。虽然我们可
以通过 shim/polyfill 来填补新的 API，但是无法填补新的语法。可以使用
Traceur（https://github.com/google/traceur-compiler/wiki/GettingStarted） 这 样的工具来实现新旧语法之间的转换。

---

# 第二部分 异步与性能

程序中现在运行的部分和将来运行的部分之间的关系就是异步编程的核心。
---
## 第一章 现在与将来

### 分块的程序

可以把js程序写在单个js文件中，但是这个程序几乎是由几个块组成的。这些块中，只有一个是现在执行的，其余的则会在将来执行。最常见的快单位是函数。

大多数新手JavaScript程序员都会遇到的问题：程序中将来执行的部分并不一定在现在执行部分执行之后立即运行。换句话来说，现在无法完成的任务将会异步完成，并不会出现人们本能认为会出现的或者希望出现的阻塞行为。

~~~js
// ajax(..)是某个库中提供的某个Ajax函数
var data = ajax( "http://some.url.1" );
console.log( data );
// 啊哦！data通常不会包含Ajax结果
~~~

从现在到将来的等待，最简单的方法（但绝对不是唯一，甚至也不是最好的）是使用一个通常称为回调函数的函数：
~~~js
// ajax(..)是某个库中提供的某个Ajax函数
ajax( "http://some.url.1", function myCallbackFunction(data){
  console.log( data ); // 耶！这里得到了一些数据！
} );
~~~

> 可能你已经听说过，可以发送同步 Ajax 请求。尽管技术上说是这样，但是，在任何情况下都不应该使用这种方式，因为它会锁定浏览器 UI（按钮、菜单、滚动条等），并阻塞所有的用户交互。这是一个可怕的想法，一定要避免。

~~~js
function now() {
  return 21;
}
function later() {
  answer = answer * 2;
  console.log( "Meaning of life:", answer );
}
var answer = now();
setTimeout( later, 1000 ); // Meaning of life: 42
~~~
这个程序有两个块：现在执行的部分，以及将来执行的部分。这两块的内容很明显，但这
里我们还是要明确指出来。
~~~js
// 现在
function now() {
  return 21;
}
function later() { .. }
var answer = now();
setTimeout( later, 1000 );

// 将来
answer = answer * 2;
console.log( "Meaning of life:", answer );
~~~
任何时候，只要把一段代码包装成一个函数，并指定它在响应某个事件（定时器、鼠标点击、Ajax 响应等）时执行，你就是在代码中创建了一个将来执行的块，也由此在这个程序
中引入了异步机制。

### 事件循环

尽管你显然能够编写异步 JavaScript 代码
（就像前面我们看到的定时代码），但直到最近（ES6），JavaScript 才真正内建有直接的异
步概念。

JavaScript 引擎本身所做的只不过是在需要的时候，在给定的任意时刻执行程序中的单个代码块。

JavaScript 引擎并不是独立运行的，它运行在宿主环境中，对多数开发者来说通常就是
Web 浏览器。经过最近几年（不仅于此）的发展，JavaScript 已经超出了浏览器的范围，
进入了其他环境，比如通过像 Node.js 这样的工具进入服务器领域。实际上，JavaScript 现
如今已经嵌入到了从机器人到电灯泡等各种各样的设备中。

但是，所有这些环境都有一个共同“点”（thread，也指线程。不论真假与否，这都不算一
个很精妙的异步笑话），即它们都提供了一种机制来处理程序中多个块的执行，且执行每
块时调用 JavaScript 引擎，这种机制被称为事件循环。

话句话说：JavaScript引擎本身没有时间的概念，只是一个按需执行JavaScript任意代码片段的环境。“事件”（JavaScript代码执行）调度总是由包含它的环境进行。

**那么，什么是事件循环？？**

先通过一段伪代码了解一下这个概念:
~~~js
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = [ ];
var event;
// “永远”执行
while (true) {
// 一次tick
  if (eventLoop.length > 0) {
  // 拿到队列中的下一个事件
    event = eventLoop.shift();
    // 现在，执行下一个事件
    try {
      event();
    }
    catch (err) {
      reportError(err);
    }
  }
}
~~~

你可以看到，有一个用 while 循环实现的持续运行的循环，循环的每一轮称为一个 tick。
对每个 tick 而言，如果在队列中有等待事件，那么就会从队列中摘下一个事件并执行。这
些事件就是你的回调函数。

一定要清楚， setTimeout(..) 并 没有把你的回调函数挂在事件循环队列中。它所做的是设
定一个定时器。当定时器到时后，环境会把你的回调函数放在事件循环中，这样，在未来
某个时刻的 tick 会摘下并执行这个回调。

如果这时候事件循环中已经有 20 个项目了会怎样呢？你的回调就会等待。它得排在
其他项目后面——通常没有抢占式的方式支持直接将其排到队首。这也解释了为什么
setTimeout(..) 定时器的精度可能不高。大体说来，只能确保你的回调函数不会在指定的
时间间隔之前运行，但可能会在那个时刻运行，也可能在那之后运行，要根据事件队列的
状态而定。

所以换句话来说，程序通常分成了很多的小块，在事件队列中一个接一个的执行，严格来说，和你程序不直接相关的其他事件也可能插入到队列中。

### 并行线程

异步是现在和将来的时间间隙，并行是关于能够同时发生的事情。

并行计算最常见的工具就是进程和线程。进程和线程能够独立运行，并可能同时运行：在不同的处理器上，甚至不同的计算机上，但多个线程能够共享单个进程的内存。

与之相对的是，事件循环把自身的工作分成一个个任务并顺序执行，不允许对共享内存的
并行访问和修改。通过分立线程中彼此合作的事件循环，并行和顺序执行可以共存。

并行线程的交替执行和异步事件的交替调度，其粒度是完全不同的。

JavaScript 从不跨线程共享数据，这意味着不需要考虑多线程交错运行，可能会得到出乎意料的、不确定的行为。但是这并不意味着 JavaScript 总是确定性的：

~~~js
var a = 1;
var b = 2;
function foo() {
  a++;
  b = b * a;
  a = b + 3;
}
function bar() {
  b--;
  a = 8 + b;
  b = a * 2;
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
~~~
块1是同步的，而块2、块3是异步的：
~~~js
// 块 1：
var a = 1;
var b = 2;
// 块 2（ foo() ）：
a++;
b = b * a;
a = b + 3;
// 块 3（ bar() ）：
b--;
a = 8 + b;
b = a * 2;
~~~
所以这段程序可能存在两种不同的输出结果

~~~js
输出 1：
var a = 1;
var b = 2;
// foo()
a++;
b = b * a;
a = b + 3;
// bar()
b--;
a = 8 + b;
b = a * 2;
a; // 11
b; // 22
输出 2：
var a = 1;
var b = 2;
// bar()
b--;
a = 8 + b;
b = a * 2;
// foo()
a++;
b = b * a;
a = b + 3;
a; // 183
b; // 180
~~~
同一段代码有不同的输出意味着还存在不确定性，但是这种不确定性实在函数的执行顺序级别上的，而不是多线程下的语句顺序的问题。换句话说，这一确定性要高于多线程情况。

在 JavaScript 的特性中，这种函数顺序的不确定性就是通常所说的竞态条件（race
condition）， foo() 和 bar() 相互竞争，看谁先运行。具体来说，因为无法可靠预测 a 和 b的最终结果，所以才是竞态条件。

### 并发

现在让我们来设想一个展示状态更新列表（比如社交网络新闻种子）的网站，其随着用户
向下滚动列表而逐渐加载更多内容。要正确地实现这一特性，需要（至少）两个独立的
“进程”同时运行（也就是说，是在同一段时间内，并不需要在同一时刻）。

这里的“进程”之所以打上引号，是因为这并不是计算机科学意义上的真正
操作系统级进程。这是虚拟进程，或者任务，表示一个逻辑上相关的运算序
列。之所以使用“进程”而不是“任务”，是因为从概念上来讲，“进程”的
定义更符合这里我们使用的意义。

#### 非交互

两个或多个“进程”在同一个程序内并发地交替运行它们的步骤 / 事件时，如果这些任务
彼此不相关，就不一定需要交互。如果进程间没有相互影响的话，不确定性是完全可以接
受的。

#### 交互

更常见的情况是，并发的“进程”需要相互交流，通过作用域或 DOM 间接交互。正如前
面介绍的，如果出现这样的交互，就需要对它们的交互进行协调以避免竞态的出现。

~~~js
var a, b;
function foo(x) {
  a = x * 2;
  baz();
}
function bar(y) {
  b = y * 2;
  baz();
}
function baz() {
  console.log(a + b);
}
// ajax(..)是某个库中的某个Ajax函数
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
~~~
所谓了协调就是给执行添加条件，也叫门
~~~js
var a, b;
function foo(x) {
  a = x * 2;
  if (a && b) {
    baz();
  }
}
function bar(y) {
  b = y * 2;
  if (a && b) {
    baz();
  }
}
function baz() {
  console.log( a + b );
}
// ajax(..)是某个库中的某个Ajax函数
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
~~~
包裹 baz() 调用的条件判断 if (a && b) 传统上称为门（gate），我们虽然不能确定 a 和 b
到达的顺序，但是会等到它们两个都准备好再进一步打开门（调用 baz() ）。
另一种可能遇到的并发交互条件有时称为竞态（race），但是更精确的叫法是门闩（latch）。
它的特性可以描述为“只有第一名取胜”。在这里，不确定性是可以接受的，因为它明确
指出了这一点是可以接受的：需要“竞争”到终点，且只有唯一的胜利者。
#### 协作

还有一种并发合作方式，称为并发协作（cooperative concurrency）。这里的重点不再是通过
共享作用域中的值进行交互（尽管显然这也是允许的！）。这里的目标是取到一个长期运
行的“进程”，并将其分割成多个步骤或多批任务，使得其他并发“进程”有机会将自己
的运算插入到事件循环队列中交替运行。

~~~js
var res = [];
// response(..)从Ajax调用中取得结果数组
function response(data) {
  // 添加到已有的res数组
  res = res.concat(
  // 创建一个新的变换数组把所有data值加倍
    data.map( function(val){
      return val * 2;
    } )
  );
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
~~~
如果 "http://some.url.1" 首先取得结果，那么整个列表会立刻映射到 res 中。如果记录
有几千条或更少，这不算什么。但是如果有像 1000 万条记录的话，就可能需要运行相当
一段时间了（在高性能笔记本上需要几秒钟，在移动设备上需要更长时间，等等）。
这样的“进程”运行时，页面上的其他代码都不能运行，包括不能有其他的 response(..)
调用或 UI 刷新，甚至是像滚动、输入、按钮点击这样的用户事件。这是相当痛苦的。
所以，要创建一个协作性更强更友好且不会霸占事件循环队列的并发系统，你可以异步地
批处理这些结果。每次处理之后返回事件循环，让其他等待事件有机会运行。
决绝办法：
~~~js
var res = [];
// response(..)从Ajax调用中取得结果数组
function response(data) {
// 一次处理1000个
var chunk = data.splice( 0, 1000 );
// 添加到已有的res组
  res = res.concat(
  // 创建一个新的数组把chunk中所有值加倍
    chunk.map( function(val){
      return val * 2;
    } )
);
// 还有剩下的需要处理吗？
if (data.length > 0) {
// 异步调度下一次批处理
  setTimeout( function(){
    response( data );
    }, 0 );
  }
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
~~~

我们把数据集合放在最多包含 1000 条项目的块中。这样，我们就确保了“进程”运行时
间会很短，即使这意味着需要更多的后续“进程”，因为事件循环队列的交替运行会提高
站点 /App 的响应（性能）。
当然，我们并没有协调这些“进程”的顺序，所以结果的顺序是不可预测的。如果需要排
序的话，就要使用和前面提到类似的交互技术，或者本书后面章节将要介绍的技术。
这里使用 setTimeout(..0) （hack）进行异步调度，基本上它的意思就是“把这个函数插入
到当前事件循环队列的结尾处”。
> 严格说来，setTimeout(..0) 并不直接把项目插入到事件循环队列。定时器会在有机会的时候插入事件。举例来说，两个连续的 setTimeout(..0) 调用不能保证会严格按照调用顺序处理，所以各种情况都有可能出现，比如定时器漂移，在这种情况下，这些事件的顺序就不可预测。在 Node.js 中，类似的方法是 process.nextTick(..)。尽管它们使用方便（通常性能也更高），但并没有（至少到目前为止）直接的方法可以适应所有环境来确保异步事件的顺序。下一小节我们会深入讨论这个话题。

### 任务

在 ES6 中，有一个新的概念建立在事件循环队列之上，叫作任务队列（job queue）

任务和 setTimeout(..0) hack 的思路类似，但是其实现方式的定义更加良好，对顺序的保
证性更强：尽可能早的将来。

设想一个调度任务（直接地，不要 hack）的 API，称其为 schedule(..) 。

~~~js
console.log( "A" );
setTimeout( function(){
  console.log( "B" );
}, 0 );
// 理论上的"任务API"
schedule( function(){
  console.log( "C" );
  schedule( function(){
    console.log( "D" );
  } );
} );
//  A C D B
~~~

---

## 第二章 回调
### continuation
### 顺序大脑

#### 嵌套回调与链式回调

```js
listen('click', function handler(e) {
  setTimeout(function request() {
    ajax('http://some.url.1', function response(text) {
      if (text == 'hello') {
        handler()
      } else if (text == 'world') {
        request()
      }
    })
  }, 500)
})
```
上边的这种代码通常称为回调地狱或者毁灭金字塔。

但是实际上回调地狱和嵌套与缩进没有什么关系。它引起的问题比这些严重的多。

感觉回调这一章大部分是以故事的形式在讲回调的一些问题。不是很懂，以后再看，先过。

---

## Promise 

### 具有 then 方法的鸭子类型

如何确定某个值是不是真正的 Promise？

识别Promise就是定义某种称为 thenable 的东西，将其定义为任何具有 then(...) 方法的对象或者函数。我们认为这样的值就是 Promise 一致的 thenable。

根据一个值的形态（具有哪些属性）对这和个值的类型做出一些假定，这种类型检查一般用术语鸭子类型来表示---“如果它看起来像鸭子，叫起来像鸭子，那它一定就是一条鸭子”，于是对 thenable 值的鸭子类型检测就大致类似：

~~~js
if (p !== null && (typeor p === 'object' || typeof p === 'function') && typeof p.then === 'function') {
  // 假定这是一个 thenable
} else {
  // 不是 thenable
}
~~~

但是这个逻辑会带来更深层次的麻烦。

假如我们正好有一个对象含有 then 方法，那么它也会被当作 thenable 或者 Promise，比如：
~~~js
Object.prototype.then = function () {}
Array.prototype.then = function () {}

var v1 = {hello: 'world'}
var v2 = ['hello', 'world']
~~~

按照上边的鸭子类型检查，v1,v2都是 thenable。尤其时一些在 ES6 之前就有的一些非常著名的非 Promise 库恰好有 thenable 方法，要么就是重新命名自己的方法，要么就是降级与 Promise 不兼容，否则容易产生无法追踪的 bug。

### Promise 的信任问题

#### 调用过早

一个人有时同步完成，有时异步完成，这可能会导致竞态条件（不确定性），比如：
```js
function result () {
  console.log(a)
}
var a = 0
ajax('...', result) // 无法确定 ajax 是同步还是异步，result 的输出结果也不一样
a++
```
但是，Promise 不存在这种问题，即使是立即完成的 Promise 也无法被同步观察到。

也即是说，对一个 Promise 调用 then(...) 的时候，即使这个 Promise 已经决议，提供给 then 的回调也总是会被异步调用。不会存在上边可能是同步调用的问题，所以不需要插入 setTimout 这一类 hack 来异步调用。

#### 调用过晚

~~~js
var p = new Promise((resolve) => {
	setTimeout(() =>{resolve()}, 5000)
})

p.then(() => {
	p.then(() => console.log('c'))
	console.log('a')
})

p.then(() => console.log('b'))
// 5s 后
// a b c
~~

Promise 所有通过 then(...) 方法注册的回调都会在下一个异步时机上依次被立即调用。回调中任何一个都无法影响或者延误对其回调的调用。

#### Promise 调度技巧

如果两个 Promise p1 和 p2 都已经决议，那么 p1.then(...) 和 p2.then(...) 最终应该会先调用 p1 的回调，然后 p2 的回调。但是，有些微妙的场景不是这样的，比如：
~~~js
var p3 = new Promise((resolve) => {
  resolve('p3')
})
var p1 = new Promise((resolve) => {
  resolve(p3)
})
var p2 = new Promise((resolve) => {
  resolve('p2')
})
p1.then((v) => {
  console.log(v)
})
p2.then((v) => {
  console.log(v)
})
// p2 p3
~~~
结果不是p1 的回调先调用，而是 p2 的回调。因为 p1 不是立即值，而是用另一个 Promise p3 l决定。

#### 回调未调用

只要注册了完成回调和拒绝回调，那么 Promise 在决议时，总会调用其中一个。

#### 调用次数过多或者过少

Promise 只能决议一次。

#### 吞掉错误或者异常

```js
var p = new Promise(resolve => {
  foo.bar()
  resolve(42)
})
p.then(
  () => {}, 
  error => console.log(error) // 会捕获到错误
) 
```
在 Promise 的创建过程中，或者在查看其决议结果过程中的任何时间点上出现一个 JavaScript 异常的错误，都会使这个 Promise 拒绝。

如果在完成回调中出现了错误：
~~~js
var p = new Promise(resolve => {
  resolve(42)
})
p.then(
  (msg) => {
    foo.bar()
    console.log(msg)
  }, 
  error => console.log(error) // 此时无法捕获到错误
)
~~~
此时是无法捕获到异常的，因为 Promise.then(...) 本身返回了一个 Promise，所以在上一个完成回调中的错误应该是在返回的 Promise 中侦听和捕获：
~~~js
var p = new Promise(resolve => {
  resolve(42)
})
p.then(
  (msg) => {
    foo.bar()
    console.log(msg)
  }, 
  error => console.log(error)
).then(() => {}, error => console.log(error)) // 这里可以捕获到异常
~~~

基于上面几点，Promise 这种模式通过可信任的语义把回调作为参数传递，把回调的控制权反转回来，使得这种行为更加可靠和合理。

### 链式流
### 错误处理

* 对于多数的开发者来说，错误处理的最自然的形式就是同步的try...catch结构，遗憾的是它只能是同步，而无法处理异步代码模式。
* 成功回调中出现的错误无法被当前 then 中的失败回调捕捉，只能是在下一个 Promise 中捕捉。
```js
var p = Promise.resolve( 42 );
p.then(
function fulfilled(msg){
  // 数字没有string函数，所以会抛出错误
  console.log( msg.toLowerCase() );
  },
  function rejected(err){
  // 永远不会到达这里
  }
);
```
#### 绝望的陷阱

为了避免丢失被忽略和被抛弃的 Promise 错误，一些开发者表示，Promise 的最佳实践就是最后总以一个 cache 结束：
```js
var p = Promise.resolve( 42 );
p.then(
  function fulfilled(msg){
  // 数字没有string函数，所以会抛出错误
  console.log( msg.toLowerCase() );
  }
)
.catch( handleErrors );
```
因为我们没有为 then(..) 传入拒绝处理函数，所以默认的处理函数被替换掉了，而这仅仅是把错误传递给了链中的下一个 promise。因此，进入 p 的错误以及 p 之后进入其决议（就像 msg.toLowerCase() ）的错误都会传递到最后的 handleErrors(..) 。

那么如果 handleErrors 本身出现错误怎么办？在尾部添加一个 cache 只能是降低了丢失错误的可能性。

#### 处理未捕获的情况

这节内容不是很懂。

### Promise 模式

####  Promise.all([ .. ])

#### Promise.race([ .. ])

#### all 和 race 的变体

* none 

这个模式类似于 all([ .. ]) ，不过完成和拒绝的情况互换了。所有的 Promise 都要被拒绝，即拒绝转化为完成值，反之亦然。

* any([ .. ])

这个模式与 all([ .. ]) 类似，但是会忽略拒绝，所以只需要完成一个而不是全部。

* first([ .. ])

这个模式类似于与 any([ .. ]) 的竞争，即只要第一个 Promise 完成，它就会忽略后续的任何拒绝和完成。

* last([ .. ])

这个模式类似于 first([ .. ]) ，但却是只有最后一个完成胜出。

有些 Promise 抽象库提供了这些支持，但也可以使用 Promise、 race([ .. ]) 和 all([ .. ])这些机制，你自己来实现它们。
比如 first:
~~~js
// polyfill安全的guard检查
if (!Promise.first) {
Promise.first = function(prs) {
  return new Promise( function(resolve,reject){
  // 在所有promise上循环
    prs.forEach( function(pr){
    // 把值规整化
      Promise.resolve( pr )
      // 不管哪个最先完成，就决议主promise
      .then( resolve );
      } );
    } );
  };
}
~~~

### Promise API 概述

####  new Promise(..) 构造器

有启示性的构造器 Promise(..) 必须和 new 一起使用，并且必须提供一个函数回调。这个回调是同步的或立即调用的。这个函数接受两个函数回调，用以支持 promise 的决议。通常我们把这两个函数称为 resolve(..) 和 reject(..) ：

```js
var p = new Promise( function(resolve,reject){
// resolve(..)用于决议/完成这个promise
// reject(..)用于拒绝这个promise
} );
```

reject(...) 就是拒绝这个 Promise；但 resolve(...) 既可能完成这个 Promise 也可能拒绝这个 Promise，要根据传入的参数决定。如果传入的是一个非 Promise 或者 非 thenable 的立即值，这个 promise 就会用这个值完成。

如果传入的是一个 Promise 或者 thenable 这个只就会被递归展开，并且要构造的 Promise 就会取其最终的值或者状态。

####  Promise.resolve(..) 和 Promise.reject(..)

####  then(..) 和 catch(..)

####  Promise.all([ .. ]) 和 Promise.race([ .. ])

```js
var p1 = Promise.resolve( 42 );
var p2 = Promise.resolve( "Hello World" );
var p3 = Promise.reject( "Oops" );
Promise.race( [p1,p2,p3] )
.then( function(msg){
console.log( msg ); // 42
} );
Promise.all( [p1,p2,p3] )
.catch( function(err){
console.error( err ); // "Oops"
} );
Promise.all( [p1,p2] )
.then( function(msgs){
console.log( msgs ); // [42,"Hello World"]
} );
```

> 当心！若向 Promise.all([ .. ]) 传入空数组，它会立即完成，但 Promise.race([ .. ]) 会挂住，且永远不会决议。

### Promise 局限性

#### 顺序错误处理

即 Promise 链中的错误很容易被无意中默默忽略掉。

#### 单决议

#### 惯性

#### 无法取消的 Promise

#### Promise 性能

---

## 第四章 生成器

### 打破完整的运行

在第 1 章中，我们解释了 JavaScript 开发者在代码中几乎普遍依赖的一个假定：一个函数
一旦开始执行，就会运行到结束，期间不会有其他代码能够打断它并插入其间。

可能看起来似乎有点奇怪，不过 ES6 引入了一个新的函数类型，它并不符合这种运行到结
束的特性。这类新的函数被称为生成器。

~~~js
var x = 1

function *foo () {
  x++
  yield
  console.log("x:", x)
}

function bar () {
  x++
}
~~~

很可能你看到的其他多数 JavaScript 文档和代码中的生成器声明格式都是function* foo() { .. }，而不是我这里使用的 function *foo() { .. }：
唯一区别是 * 位置的风格不同。这两种形式在功能和语法上都是等同的，还有一种是 function*foo(){ .. }（没有空格）也一样。两种风格，各有优缺，但总体上我比较喜欢 function *foo.. 的形式，因为这样在使用 *foo()来引用生成器的时候就会比较一致。如果只用 foo() 的形式，你就不会清楚知道我指的是生成器还是常规函数。这完全是一个风格偏好问题。

现在，我们要如何运行前面的代码片段，使得 bar() 在 *foo() 内部的 yield 处执行呢？
```js
// 构造一个迭代器it来控制这个生成器
var it = foo();
// 这里启动foo()！
it.next();
x; // 2
bar();
x; // 3
it.next(); // x: 3
```

1. it = foo() 并没有执行生成器 *foo()，而只是构造了一个迭代器（iterator），这个迭代器会控制它的执行。

2. 第一个 it.next() 启动了生成器 *foo()，并且运行了第一行 x++。

3.  *foo() 在 yield 语句处暂停，在这一点上第一个 it.next() 调用结束。此时 *foo() 仍
在运行并且是活跃的，但处于暂停状态。

4. 我们查看 x 的值，此时为 2 。

5. 我们调用 bar() ，它通过 x++ 再次递增 x 。

6. 我们再次查看 x 的值，此时为 3 。

7. 最后的 it.next() 调用从暂停处恢复了生成器 *foo() 的执行，并运行 console.log(..)
语句，这条语句使用当前 x 的值 3 。

生成器就是一类特殊的函数，可以一次或多次启动和停止，并不一定非得要完成。

#### 输入和输出

生成器仍然是一个函数，这意味着它仍然有一些基本的特性没有改变。比如，它仍然可以接受参数（即输入），也能够返回值（即输出）。

但难以理解的是，生成器 *foo(..) 并没有像普通函数一样实际运行。事实上，我们只是创建了一个迭代器对象，把它赋给了一个变量 it ，用于控制生成器
*foo(..) 。然后调用 it.next() ，指示生成器 *foo(..) 从当前位置开始继续运行，停在下
一个 yield 处或者直到生成器结束。

这个 next(..) 调用的结果是一个对象，它有一个 value 属性，持有从 *foo(..) 返回的值
（如果有的话）。换句话说， yield 会导致生成器在执行过程中发送出一个值，这有点类似
于中间的 return 。

**目前还不清楚为什么需要这一整个间接迭代器对象来控制生成器**

#### 迭代消息传递

```js
function *foo(x) {
  var y = x * (yield);
  return y;
}
var it = foo( 6 );
// 启动foo(..)
it.next();
var res = it.next( 7 );
res.value; // 42
```

注意，这里有一点非常重要，但即使对于有经验的 JavaScript 开发者也很有迷惑性：根据
你的视角不同， yield 和 next(..) 调用有一个不匹配。一般来说，需要的 next(..) 调用要
比 yield 语句多一个，前面的代码片段有一个 yield 和两个 next(..) 调用。

为什么会有这个不匹配？

因为第一个 next(..) 总是启动一个生成器，并运行到第一个 yield 处。不过，是第二个
next(..) 调用完成第一个被暂停的 yield 表达式，第三个 next(..) 调用完成第二个 yield，以此类推。

#### 两个问题

```js
var y = x * (yield);
return y;
```
第一个 yield 基本上是提出了一个问题：“这里我应该插入什么值？”

谁来回答这个问题呢？第一个 next() 已经运行，使得生成器启动并运行到此处，所以显
然它无法回答这个问题。因此必须由第二个 next(..) 调用回答第一个 yield 提出的这个
问题。

把视角转化一下：不从生成器的视角看这个问题，而是从迭代器的角度。

**为了恰当阐述这个视角，我们还需要解释一下：消息是双向传递的**—— yield.. 作为一个
表达式可以发出消息响应 next(..) 调用， next(..) 也可以向暂停的 yield 表达式发送值。
考虑下面这段稍稍调整过的代码：

```js
function *foo(x) {
  var y = x * (yield "Hello"); // <-- yield一个值！
  return y;
}
var it = foo( 6 );
var res = it.next(); // 第一个next()，并不传入任何东西
res.value; // "Hello"
res = it.next( 7 ); // 向等待的yield传入7
res.value; // 42
```

yield .. 和 next(..) 这一对组合起来，在生成器的执行过程中构成了一个双向消息传递系统。

```js
var res = it.next(); // 第一个next()，并不传入任何东西
res.value; // "Hello"
res = it.next( 7 ); // 向等待的yield传入7
res.value; // 42
```

我们并没有向第一个 next() 调用发送值，这是有意为之。**只有暂停的 yield才能接受这样一个通过 next(..) 传递的值**，而在生成器的起始处我们调用
第一个 next() 时，还没有暂停的 yield 来接受这样一个值。规范和所有兼
容浏览器都会默默丢弃传递给第一个 next() 的任何东西。传值过去仍然不
是一个好思路，因为你创建了沉默的无效代码，这会让人迷惑。因此，启动
生成器时一定要用不带参数的 next()。

**第一个 next() 调用（没有参数的）基本上就是在提出一个问题：“生成器 *foo(..) 要给我的下一个值是什么”。谁来回答这个问题呢？第一个 yield "hello" 表达式。**
看见了吗？这里没有不匹配。

根据你认为提出问题的是谁， yield 和 next(..) 调用之间要么有不匹配，要么没有。
但是，稍等！与 yield 语句的数量相比，还是多出了一个额外的 next() 。**所以，最后一个it.next(7) 调用再次提出了这样的问题：生成器将要产生的下一个值是什么。但是，再没有 yield 语句来回答这个问题了，是不是？那么谁来回答呢？return 语句回答这个问题！**

**所以每一个next()都对应一个yield，如果最后一个next()找不到对应的yield，就会使用return的值，并且完成生成器。**

如果你的生成器中没有 return 的话——在生成器中和在普通函数中一样， return 当然不
是必需的——总有一个假定的 / 隐式的 return; （也就是  return undefined; ），它会在默认情况下回答最后的 it.next(7) 调用提出的问题。
这样的提问和回答是非常强大的：通过 yield 和 next(..) 建立的双向消息传递。但**目前还不清楚这些机制是如何与异步流程控制联系到一起的**。会清楚的！

### 生成器产生值

迭代器是一个定义良好的接口，用于从一个生产者一步步得到一系列值。JavaScript 迭代器的接口，与多数语言类似，就是每次想要从生产者得到下一个值的时候调用 next() 。

```js
var something = (function () {
  var nextVal

  return {
    [Symbol.iterator]: function () {
      return this
    },
    next: function () {
      if (nextVal === undefined) {
        nextVal = 1
      } else {
        nextVal = (3 * nextVal) + 6
      }
      return { value: nextVal, done: false }
    }
  }
})
```

next()调用返回一个对象。这个对象有两个属性： done 是一个 boolean 值。标识迭代器的完成状态，value 中放置迭代值。

ES6 还心中了一个 for ...of 循环，这意味着可以通过原生循环语法自动迭代标准迭代器。

~~~js
for (var v of something) {
  console.log(v)

  // 不要死循环
  if(v > 500) {
    break
  }
}
~~~

因为我们的迭代器 something 总是返回 done:false，因此这个 for...of 循环将永远的运行下去，这也就是为什么我们要在里面放一个 break 条件。迭代器永不结束是完全没问题的，但也是有一些情况下，迭代器会在有限的值集合上运行，并最终返回 done: true

~~~js
for (var ret;(ret = something.next()) && !ret.done) {
  console.log(ret.value)

  // 不要死循环
  if (ret.value > 50) {
    break
  }
}
~~~

#### iterable

前面例子中 something 对象叫做迭代器，因为它的接口中有一个 next() 方法。而与其紧密相关的一个术语是 iterable，即指一个包含可以在其值上迭代的迭代器的对象。比如 Array 自带 Symbol.iterator 属性且属性值是一个函数。

从 ES6 开始，从一个iterable 中提取迭代器的方法是： iterable 必须支持一个函数，其名称是专门的 ES6 符号返回值 Symbol.iterator。这个函数会返回一个迭代器。

~~~js
[Symbol.iterator]: function () {
  return this
}
~~~

现在 something 的值既是一个 iterable 也是一个迭代器。

#### 生成器迭代器

可以把生成器看成是一个值的生产者，我们通过迭代器接口的 next 方法调用一个提取除一个值。

所以，严格来说，生成器并不是 iterable，尽管非常类似，当前执行一个生成器，就会得到一个迭代器

~~~js
function *foo () {

}
var it = foo()
~~~

因此可以通过生成器来实现前面的这个 something 无线数字序列生产者
~~~js
function *something () {
  var nextVal

  while (true) {
    if (nextVal === undefined) {
      nextVal = 1
    } else {
      nextVal = (3 * nextVal) + 6
    }
  }

  yield nextVal
}
~~~

现在可以通过for...of循环来使用我们雕琢过的新的 *something() 生成器。方式基本和iterable是一样的。

~~~js
for (var v of something()) {
  console.log(v)

  // 不要死循环
  if (v > 500) {
    break
  }
}
~~~

* 为什么不能用 for (var of something) ? 因为这里的 something 是生成器，并不是 iterable。我们需要调用 something() 来构造一个生产者供 for ... of 循环迭代。

* something() 调用产生也有一个迭代器，但是 for ... of 循环需要的是一个 iterable。生成器也有一个 Symbol.iterator 函数，基本上这个函数做的就是return this，和我们前面定义的 iterable something 一样。换句话，**生成器的迭代器也是一个 iterable**。

#### 停止生成器

在前面的例子中，看起来似乎 *something() 生成器的迭代器实例在循环中的 break 调用之后就永远留在了挂起的状态。

其实有一个隐藏的特性会帮助你管理此事，for ... of循环的“异常结束”，也就是“提前终止”，通常由 break、return或者未捕获的异常引起，会向生成器的迭代器发送一个信号使其终止。

> 严格的来说，在循环正常结束之后，for ... of 循环也会向迭代器发送这个信号。对于生成器来说，这本质上是没有意义的操作。因为生成器的迭代器需要先完成 for ... of 循环才能结束，但是，自定义的迭代器可能会需要从 for ... of 循环的消费者那里接收这个额外的信号。

尽管 for ... of 循环会自动发送这个信号，但是你可能会希望向一个迭代器手工发送这个信号。可以通过调用， return(...) 实现这一点。

如果在生成器内有 try ... finally 语句，它将总会运行，即使生成器已经外部结束。如果需要清理资源的话，这一点非常的有有用。

~~~js
function *something () {
  try {
    var nextVal

    while (true) {
      if (nextVal === undefined) {
        nextVal = 1
      } else {
        nextVal = (3 * nextVal) + 6
      }
      yield nextVal
    }
  } finally {
    console.log('cleaning up')
  }
}
~~~

之前的例子中，for ... of 循环内 break 会触发 finally 语句。但是，也可以在外部通过 return(...) 手工终止生成器这样的迭代实例。

~~~js
var it = something()

for (var v of it) {
  console.log(v)
  if (v > 500) {
    // 完成生成器的迭代器
    console.log(it.return('helle world').value)
    // 不需要 break
  }
}
~~~

调用 it.return(...) 之后，它立即会终止生成器，这当然会运行 finally 语句。它还会把返回的 value 值设置为传人 return(...) 的内容，这也就是'hello world'被传出去的过程。现在我们也不需要 break 语句，因为生成器的迭代器已经被设置为 done: true，所以 for ... of 循环会在下一个迭代终止。

### 异步迭代生成器

生成器与异步编码模式以及解决回调问题等，有什么关系？

回想以下之前的例子：
~~~js
function foo (x, y, cb) {
  ajax('http://some.url.1/?x='+' x '+' &y=' + y, db)
}
foo (11, 31, function () {
  if (error) {
    console.error(error)
  } else {
    console.log(text)
  }
})
~~~

如果想通过生成器来实现：
~~~js
function foo (x, y) {
  ajax('http://some.url.1/?x='+' x '+' &y=' +  y, 
  function (error, data) {
    if (error) {
      it.throw(error)
    } else {
      it.next(data)
    }
  })
}
function *main () {
  try {
    var text = yield foo(11, 31)
    console.log(text)
  } catch (error) {
    console.log(error)
  }
}
var it = main()

it.next()
~~~

#### 同步错误处理

之前我们知道 try catch 只能捕获到同步代码的错误，我们看看上边的代码：
~~~js
function *main () {
  try {
    var text = yield foo(11, 31)
    console.log(text)
  } catch (error) {
    // 这里可以捕获到 迭代器抛出的 error
    console.log(error)
  }
}
~~~
我们可以将异步的错误抛入生成器中进行处理。

### 生成器加迭代器

**获得 promise 和 生成器最大效用的最自然的方法就是yield出来一个promise，然后通过这个promise来控制生成器的迭代。**

让我们尝试把支持promise的foo(...)和生成器*main()放在一起：
~~~js
function foo () {
  return request('http://some.url.1/?x='+' x '+' &y=' +  y)
}

function *main () {
  try {
    var text = yield foo(11, 31)
    console.log(text)
  } catch(error) {
    console.error(error)
  }
}

var it = main()

var p = it.next().value
p.then(
  function (text) {
    it.next(text)
  },
  function (error) {
    it.throw(error)
  }
)
~~~
这种写法解决掉了之前的回调。隐藏了if (err) {...}这样的细节，由promise来分离完成和拒绝。

#### 支持Promise的generator runner

如果有一种方法可以实现重复（循环）迭代控制，每次会生成一个promise，等其决议之后再继续，那该多好。

~~~js
function run (gen) {
  var aggs = [].slice.call(arguments, 1), it

  // 在当前上下文中初始化生成器
  it = gen.apply(this, args)

  // 返回一个promise用于生成器完成
  return Promise.resolve()
    .then(function handleNext(value) {
      // 对下一个yield出的值运行
      var next = it.next(value)
      return (function handleResult(next) {
        // 生成器运行完毕
        if (next.done) {
          return next.value
        } else {
          return Promise.resolve(next.value)
            .then(
              handleNext,
              function handleError(error) {
                return Promise.resolve(it.throw(error)).then(handleResult)
            })
        }
      })(next)
    })
}
~~~

#### 生成器中promise的并发

~~~js
function *foo () {
  var r1 = yield request(...)
  var r2 = yield request(...)

  var r3 = yield request(...p1...p2)
}
~~~
最简单的改写，让r1，r2并发
~~~js
function *foo () {
  var r1 = request(...)
  var r2 = request(...)

  var p1 = yield r1
  var p2 = yield r2

  var r3 = yield request(...p1...p2)
}
~~~

换成 Promise.all([])

~~~js
function *foo () {
  var results = yield Promise.all([
    request(...),
    request(...)
  ])

  var r1 = results[0]
  var r2 = results[1]

  var r3 = yield request(...r1...r2)
}
~~~

### 生成器委托

你可能会从一个生成器调用另一个生成器

yield 委托，语法是 yield *__
~~~js
function *foo () {
  console.log('*foo() starting')
  yield 3
  yield 4
  console.log('*foo() finished')
}

function *bar () {
  yield 1
  yield 2
  yield *foo()
  yield 5
}

var it = bar()
it.next().value // 1
it.next().value // 2
it.next().value // *foo() 启动 3
it.next().value // 4
it.next().value // *foo() 完成 5
~~~

#### 为什么要委托？

yield 委托的目的主要是代码组织，以达到与普通函数调用的对称。

#### 消息委托

~~~js
function *foo () {
  console.log('inside *foo():', yield 'b')
  console.log('inside *foo():', yield 'c')
  return 'd'
}

function *bar () {
  console.log('inside *bar():', yield 'a')
  console.log('inside *bar():', yield *foo())
  console.log('inside *bar():', yield 'e')

  return 'f'
}

var it = bar()

console.log('ouside:', it.next().value) // outside: a
console.log('ouside:', it.next(1).value) // inside *bar(): 1 outside: b
console.log('ouside:', it.next(2).value) // inside *foo(): 2 outside: c
console.log('ouside:', it.next(3).value) // inside *foo(): 3 inside *bar(): d outside: e
console.log('ouside:', it.next(4).value) // inside *bar(): 4 outside: f
~~~
一一对应解析：
1. 无代码执行，代码停在 console.log('inside \*bar():', yield 'a') 生成器\*bar()给出 'a'

2. 代码执行 console.log('inside \*bar():', yield 'a')，yield 插入 1，代码停在console.log('inside \*bar():', yield \*foo()) 发现用 yield  对 \*foo()进行了委托, 这一步相当于启动了\*foo(), 并在*foo()中将代码停在console.log('inside *foo():', yield 'b') 生成器\*foo()给出 

3. 代码执行console.log('inside \*foo():', yield 'b')，yield 插入2， 代码停在 console.log('inside \*foo():', yield 'c') 生成器\*foo()给出 'c'

4. 代码执行 console.log('inside \*foo():', yield 'c')，yield插入 3，从\*foo()返回*bar()，发现之前的代码停在 console.log('inside *bar():', yield *foo()) 所以执行 console.log('inside *bar():', yield *foo())，准确来说应该是 console.log('inside *bar():', 'd')，然后将代码代码停在 console.log('inside *bar():', yield 'e') 处，所以给出'e'

5. 代码执行 console.log('inside *bar():', yield 'e')，yield插入 4，最后没有yield返回一个值，所以默认使用 return 返回的值。

#### 异步委托

#### 递归委托

yield 委托自身

### ES6 之前的生成器

---

## 程序性能

### Web Worker

从 JavaScript 主程序中，可以这样实例化一个 Worker
~~~js
var w1 = new Worker('http://...')
~~~
这个 URL 应该指向一个 JavaScript 文件的位置，这个问价将被加载到一个 Worker 中，然后浏览器启动一个独立的线程，让这个文件在这个独立的线程中运行。

> 通过这样的URL创建的Worker称为专用Woerkr，除了提供一个 指向外部文件URL,还可以通过提供一个Blob URL(另一个html5的特性)创建一个在线Worker，本质上就是一个存储在单位（二进制）值中的在线文件。

Worker 之间以及它们和主程序之间，不会共享任何作用域或资源，而是通过一个基本的事件消息机制相互联系。

Worker w1 是一个事件的侦听者和触发者，可以通过订阅它来获得这个Worker发出的事件以及发送事件给这个Worker。

侦听事件
~~~js
w1.addEventListenner('message', function (evt) {
  // evt.data
})
~~~
发送'message'

~~~js
w1.postMessage('...')
~~~

在这个 Worker 内部收发消息是完全对称的。

~~~js
addEventListenner('message', function (evt) {
  // evt.data
})

postMessage('...')
~~~

要在创建的 Worker 中终止 Worker，可以调用 Worker 对象上的 terminate()。突然终止 Worker 线程不会给它任何机会完成它的工作或者清理任何资源。这就类似通过关闭浏览器标签页来关闭页面。

#### Worker 环境

在 Worker内部是无法访问主程序的任何资源的，这意味着你不能访问它的任何全局变量，也不能访问页面dom或者其他资源。这是一个完全独立的线程。

但是，可以执行网络操作（Ajax、WebSockets）以及设定定时器，还有可以访问几个重要的全局变量和功能的本地副本，包括navigator,location,JSON和 applicationCache.

你还可以通过 importScript(...) 向 Worker 加载额外的 JavaScript 脚本。
~~~js
// 在 worker 内部
importScript('foo.js', 'bar.js')
~~~
这些脚本的加载是同步的。也就是说，importScript(...)调用会阻塞余下 Worker的执行，知道文件加载和执行完成。

Web Worker 通常用于哪些方面：
* 处理密集数学计算
* 大数据集排序
* 数据处理（压缩，音频分析，图像处理等）
* 高流量网络通信

#### 数据传递
上面提到的这些应用大多数有一个共性，就是需要在线程之间通过事件机制传递大量的信息，可能是双向。

在早期的 Worker 中，唯一的选择就是把所有数据序列化到一个字符串值中。除了双向序列化导致的速度损失之外，另外一个主要的负面因素是数据需要被复制，这意味着两倍的内存使用（以及引起的垃圾收集方面的波动）

现在我们可以使用结构化克隆算法（mdn上有相关的说明）可以把对象赋值到另一边，这个算法作非常高级，甚至可以处理要复制对象有循环引用的情况，但是它只作为API的一部分不会暴露出来，通过我们通过postMessage将消息发送到其他的窗口或者Web Worker就会用到它，所以我们一般只通过API来使用，目前IE10以及更高的版本以及所有的其他主流浏览器都支持这种方案。

~~~js
function structuralClone (obj) {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel()
    port2.onmessage = e => resolve(e.data)
    port1.postMessage(obj)
  })
}

const clone = await structuralClone(obj)
~~~

还有一个更好的选择，特别是对于大数据集，就是使用 Transferable 对象。这个时候发生的对象所有权的转移，数据本身并没有移动，一旦你把对象传递到一个 Worker 中，在原来的位置上，他就会变为空后者不可以访问，这样就消除了多线程编程作用域共享带来的混乱。当然，所有权传递是可以双向进行的。

如果使用 Transferable 对象其实不需要做什么，任何实现了 Transferable 接口的数据结构就会自动按照着种方式进行传输。

比如Uinit8Array:
~~~js
postMessage(foo.butter, [ foo.buffer ])
~~~
第一个参数就是原始缓冲区，第二个就是一个要传输的内容的列表。

#### 共享的 worker 

创建一个整个站点或者app的所有页面实例都可以共享的中心Worker就非常有用。这种称为 SharedWorker:

~~~js
var w1 = new SharedWorker('http://...')
~~~
因为共享 Worker 可以与站点的多个程序实列或者多个页面连接，所以这个 Worker 需要通过某种方式来得知消息来自于哪个程序。这个唯一的标识符就是端口。

~~~js
w1.port.addEventListener('message', handleMessage)
w1.port.postMessage('something cool')
// 端口必须要初始化
w1.port.start()
~~~

在共享 Worker 内部，必须要处理额外的一个事件： "connect" 。

~~~js
// 在共享Worker内部
addEventListener( "connect", function(evt){
// 这个连接分配的端口
  var port = evt.ports[0];
  port.addEventListener( "message", function(evt){
  // ..
    port.postMessage( .. );
  // ..
} );
// 初始化端口连接
  port.start();
} );
~~~


