---
title: 'Git更改某个提交内容和将当前改动追加到某次commit 上'
date: '2021-07-21'
---

# toc

# 前言

有时为了commit保持干净整洁，我们会将上一个或者之前的commit遗漏的提交合并到同一个commit，那么如果将某个内容追加到某次commit上就显得非常重要。

# 直接更改某次提交(改动某个指定的commit)

- 将HEAD移到需要更改的commit上（假设commit的hash是0bdf89）：`git rebase -i 0bdf89`
- 找到需要更改的commit, 将行首的pick改成edit, 按esc, 输入:wq退出
（弹出的交互式界面中显示的commit 信息，与git log 显示的顺序相反，即父节点在上显示）
- 更改这次你想要改动文件
- 使用git add 改动的文件添加改动文件到暂存
- 使用git commit --amend追加改动到第一步中指定的commit上
- 使用git rebase --continue移动HEAD到最新的commit处
- 解决冲突。如果有冲突的话，编辑冲突文件, 解决冲突
- `git add .`
- `git commit --amend`
- 解决冲突之后再执行: `git rebase --continue`

# 将工作空间中的改动追加到某次提交上
> 第0步和第2步（加粗）与上面步骤不同，其余步骤相同

- 保存工作空间中的改动：`git stash`
- 将HEAD移到需要更改的commit上: `git rebase f744c32^ --interactive`
- 找到需要更改的commit, 将行首的pick改成edit, 按esc, 输入:wq退出
- 执行命令git stash pop
- 使用git add 改动的文件添加改动文件到暂存
- 使用git commit --amend追加改动到第一步中指定的commit上
- 使用git rebase --continue移动HEAD到最新的commit处
- 解决冲突。如果有冲突的话，编辑冲突文件, 解决冲突
- `git add .`
- `git commit --amend`
- 解决冲突之后再执行: `git rebase --continue`