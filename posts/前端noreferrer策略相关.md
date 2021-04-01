---
title: '前端noreferrer策略相关'
date: '2019-03-22'
---

# toc

最近做了一个友商的跳转链接，发现发现页面跳转请求的头部有referrer字段。

MDN 上的介绍大概是这样的：Referer 请求头包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。服务端一般使用 Referer 请求头识别访问来源，可能会以此进行统计分析、日志记录以及缓存优化等。

以下两种情况不会发送：

- 来源页面采用的协议为表示本地文件的 "file" 或者 "data" URI；
- 当前请求页面采用的是非安全协议，而来源页面采用的是安全协议（HTTPS）

除了以上方法，可以通过设置 referrer 的策略来取消发送referrer

有以下集中场景：

1 CSP（Content Security Policy），是一个跟页面内容安全有关的规范。在 HTTP 中通过响应头中的 Content-Security-Policy 字段来告诉浏览器当前页面要使用何种 CSP 策略。(CSP 的指令和指令值之间以空格分割，多个指令之间用英文分号分割。)

```
 Content-Security-Policy: referrer no-referrer|no-referrer-when-downgrade|origin|origin-when-cross-origin|unsafe-url;
```

2 设置当前页面的`meta`标签

```html
<meta name="referrer" content="no-referrer|no-referrer-when-downgrade|origin|origin-when-crossorigin|unsafe-url">
```

3 关于`a area link`标签

```html
<a href="http://www.baidu.com" referrer="no-referrer|origin|unsafe-url"></a>
```

4. window.open

```js
window.open('http://external.site', 'foo', 'noopener=yes,noreferrer=yes')
```