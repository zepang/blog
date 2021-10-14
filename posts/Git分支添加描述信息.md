---
title: 'Git分支添加描述信息'
date: '2021-09-23'
---

# toc

当分支比较多或者长时间未清理的一些分支再次回来查看这些分支的时候，往往不知道每个分支创建的目的是什么、目前还有需不需要保留。所以，给每个分支一个描述是非常重要的。

Git给我们内置了命令可以去添加和查看分支的描述信息。

添加分支描述：
```
git config branch.{branch_name}.description 分支描述信息
```

查看分支描述：
```
git config branch.{branch_name}.description
```

目前，Git仅支持一个个分支查看描述，如果需要直接列出所有的分支和对应的描述，可以使用以下的方法：

```
# 全局安装
npm i -g git-br
# 使用
git br
```
