---
title: 'Gitlab CI CD相关'
date: '2021-04-07'
---

# toc

因为工作原因，学习了一些关于 gitlab ci 相关的知识，这里做个整理，方便以后查阅，同时也给其它初学者作为一个入门的参考，其实如果有足够的时间和耐心我还是建议去读gitlab的官方文档。

# Gitlab CI&CD 涉及的一些概念

1. CI/CD

    - Continuous Integration (CI)
    - Continuous Delivery (CD)
    - Continuous Deployment (CD)

2. Pipelines

    - Pipelines是持续集成、交付和部署的顶级组件
    - Pipelines由两部分组成：Jobs 和 Stages

3. Jobs

    - Jobs是`gitlab-ci.yml`文件上定义的最基本的元素
    - Jobs定义了具体要做什么
    - Jobs由runners来执行
    - Jobs不限制数量

4. Runners

    - Runners是执行Jobs的客户端（特定的服务），可以任务是Pipelines中执行Jobs是的工人
    - Runner分为以下几种：
        - Shared runners GitLab实例中的所有组和项目都可以使用共享运行器
        - Group runners 组运行器可用于组中的所有项目和子组
        - Specific runners 特定的运行器，一次只用于一个项目

目前没有接触到前两种runners，接下来提到的主要是 Specific runners

# 如何配置一个 Runner

其实文档挺详细的：https://docs.gitlab.com/runner/install/

由于有了docker的环境，而且我又不太想折腾，直接选择了docker的安装方式。

1. 创建 volumn
```
docker volume create gitlab-runner-config
```

2. 创建并运行 gitlab-runner 容器
```
docker run -d --name gitlab-runner --restart always  -v gitlab-runner-config:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock gitlab/gitlab-runner:latest
```

3. 进入容器
```
docker exec -it gitlab-runner bash 
```

4. 注册runner
```
sudo gitlab-runner register
```
运行上边的命令之后，会让你输入配置信息，如下图

![](/images/gitlab-ci-interaction.png)

上边要求输入的url和token来自：

```
Gitlab项目首页=> setting => CI/CD => Runners => Specific Runners
```

刷新这个页面，通常情况下，会显示绿色的小圆圈，这表示runner激活成功了，如果没有激活请输入下边的命令进行激活

```
sudo gitlab-runner verify
```

# 如何编写 .gitlab-ci.yml

# 如何查看和添加 CI 环境的变量

# 如何在 CI 环境中 pull 和 push 项目代码

# 最后

本文所提到的CI相关的内容只是冰山一角，关于 gitlab ci 更多的能力和使用场景请移步到官方提供的文档。

# 参考文档和文章

- https://xuyuanxiang.me/ci/2020-03-23/%E6%9C%89%E5%85%B3%E4%BC%81%E4%B8%9A%E5%86%85%E6%BA%90%E9%A1%B9%E7%9B%AE%E8%87%AA%E5%8A%A8%E5%8C%96%E6%8C%81%E7%BB%AD%E9%9B%86%E6%88%90%E7%9A%84%E4%B8%80%E4%BA%9B%E5%AE%9E%E8%B7%B5/#%E4%BD%BF%E7%94%A8-lerna-%E8%87%AA%E5%8A%A8%E5%8C%96%E7%89%88%E6%9C%AC%E7%AE%A1%E7%90%86

- https://docs.npmjs.com/integrations

- https://docs.gitlab.com/ee/ci/yaml/README.html