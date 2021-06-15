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

如果没有特殊的配置，docker 的 volumes 目录是`/var/lib/docker/volumes`，如果启动 gitlab-runner 之后，`gitlab-runner-config/_data`下会多出两个配置文件

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
sudo gitlab-runner restart
```

# 如何编写 .gitlab-ci.yml

关于yml文件的基本语法就不过多说了，可以查阅网上相关的资料

我们来看一个.gitlab-ci.yml的文件

```yml
image: node:14.15.4

before_script:
    - npm config set @scope:registry http://private-registry.com

variables:
    ENV_BUILD: 'production'

stages:
    - install
    - build
    - deploy

.base-job:
    tags: app
    only:
        refs:
            - master

install-job:
    extends: .base-job
    stage: install
    script:
        - npm install

build-job:
    extends: .base-job
    stage: build
    script:
        - npm run build

install-job:
    extends: .base-job
    stage: deploy
    script:
        - sshpass -p $PASSWORD scp -r ./dist $CUSTOM_USERNAME@$CUSTOM_SERVER_IP:/var/www/
    
```

其实，通过这些关键字字面意思大概能够理解整个yml配置文件的意思的。

1. 因为之前注册runner选择的executor是docker，首先定义了 image：node:14.15.4

2. 在before_script中定义了前置的一些npm配置

3. 将 Pipeline 分为三个阶段：install build deploy

4. 将多个job中相同的部分定义成了一个base-job，tags的定义需要和注册runner定义的一致该任务才会被执行，only关键字定义了只有在分支为master的条件下执行。

5. 分别编写三个阶段对应的job，stage关键字定义了当前job属于哪个阶段，script定义了具体需要执行的命令或者脚本

关于更多的关键说明，请查看相关的文档

配置完毕之后，当推送代码到仓库的master分支，gitlab runner会根据 gitlab-ci.yml的配置执行对应的任务。

## gitlab 提供的可视化界面

- 可以通过gitlab代码仓库 > CI CD查看所有的 Pipeline

- 点击 Pipeline id 或者 status可以进入 Pipeline 的详情页面

- 在 Pipeline 的详情页面点击对应的 job，可以看到 job 运行输出的 log 信息，job 的状态等等

更多的功能需要自行摸索

# 如何查看和添加 CI 环境的变量

这里直接贴文档地址了，可视化的配置操作，不多说了

![https://ksogit.kingsoft.net/help/ci/variables/README#variables](https://ksogit.kingsoft.net/help/ci/variables/README#variables)

# 如何在 CI 环境中 pull 和 push 项目代码

关于这块，其实网上是有很多相关的文章的。

说一下我是如何解决的吧：

1. 为了获取对应的权限，先去申请一下 project access token

2. 配置环境变量 CI_PROJECT_ACCESS_TOKEN project access token

3. 修改git remote origin 的地址

```yml
git remote add origin https://gitlab-ci-token:$CI_PROJECT_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git
```

4. 根据你创建的 project access token 的权限，可以进行拉取或者推送代码

其实，我后面有考虑过这种处理方式可能并不是特别好，别人提交代码触发ci提交代码用的也会是我的project access token，但是仅考虑到只有我自己在使用，所以，无所谓了

# 最后

本文所提到的CI相关的内容只是冰山一角，关于 gitlab ci 更多的能力和使用场景请移步到官方提供的文档。

# 参考文档和文章

- https://xuyuanxiang.me/ci/2020-03-23/%E6%9C%89%E5%85%B3%E4%BC%81%E4%B8%9A%E5%86%85%E6%BA%90%E9%A1%B9%E7%9B%AE%E8%87%AA%E5%8A%A8%E5%8C%96%E6%8C%81%E7%BB%AD%E9%9B%86%E6%88%90%E7%9A%84%E4%B8%80%E4%BA%9B%E5%AE%9E%E8%B7%B5/#%E4%BD%BF%E7%94%A8-lerna-%E8%87%AA%E5%8A%A8%E5%8C%96%E7%89%88%E6%9C%AC%E7%AE%A1%E7%90%86

- https://docs.npmjs.com/integrations

- https://docs.gitlab.com/ee/ci/yaml/README.html
