---
title: '使用lint接口来检查".gitlab-ci.yml"的语法'
date: '2020-04-23'
---

# toc

# 目标

我们在编写完".gitlab-ci.yml"文件的时候，期望能够在使用该配置文件运行ci之前确认".gitlab-ci.yml"没有语法问题。

# 解决方案

实际上gitlab的文档给我们提供两种解决方式，文档都描述的比较详细

- https://docs.gitlab.com/ee/ci/lint.html

- https://docs.gitlab.com/ee/api/lint.html

这里顺便记录下使用的过程。

# 使用

进入页面 CI/CD > Pipelines，列表头部有个lint的按钮，点进去即可以看到校验的面板，

# 使用CI Lint API

复制文档提供的案例代码，如下：

```
curl --header "Content-Type: application/json" --header "PRIVATE-TOKEN: <your_access_token>" "https://gitlab.example.com/api/v4/ci/lint" --data '{"content": "{ \"image\": \"ruby:2.6\", \"services\": [\"postgres\"], \"before_script\": [\"bundle install\", \"bundle exec rake db:create\"], \"variables\": {\"DB_NAME\": \"postgres\"}, \"types\": [\"test\", \"deploy\", \"notify\"], \"rspec\": { \"script\": \"rake spec\", \"tags\": [\"ruby\", \"postgres\"], \"only\": [\"branches\"]}}"}'
```

使用Postman导入并进行调试，需要注意这里需要更换"access token"和gitlab的请求地址。

body正文需要将ymal语法转换成json，并且进行转义，提供两个在线的工具：

- https://www.bejson.com/json/json2yaml/
- https://www.sojson.com/yasuo.html

