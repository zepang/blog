---
title: 在线Web IDE--code server部署
date: '2020-12-17'
---

代码安全一直是公司关心的问题，最近几个月就发生了几起代码泄露事故的处理。上个月的一个周末，家里断网，我跑去公司提交了一次个人github的代码，没想到被公司安全部门察觉。虽然，我提交的是个人代码和公司无关，依然收了警告邮件，并通知了部门领导。

于是，我怂了，我决定找个Web IDE环境。coding的在线编辑器令我兴喜，然而，周一跑到公司尝试了一下，coding的网站我都无法访问，公司网络限制的太厉害了。

最后，不得不用自己的服务器搭个Web IDE，以后在自己的服务器上玩了。

# 准备

* 一台服务器

* Docker环境

* Nginx

# code-server

* `code-server` [https://github.com/cdr/code-server](https://github.com/cdr/code-server)

由于之前使用过docker，环境都还在，所以，选择使用docker的方式进行部署

```bash
mkdir -p ~/.config

docker run -it --name code-server -p 127.0.0.1:8080:8080 \
  -v "$HOME/.config:/home/coder/.config" \
  -v "$PWD:/home/coder/project" \
  -u "$(id -u):$(id -g)" \
  # 此处填写等会访问Web IDE密码
  -e "PASSWORD=xxxxx"
  codercom/code-server:latest
```

跑完之后查看一下容器是否正常运行

```
➜  ~ docker container ls -a
CONTAINER ID   IMAGE                         COMMAND                  CREATED       STATUS       PORTS                    NAMES
62d7182c80ea   codercom/code-server:latest   "/usr/bin/entrypoint…"   8 hours ago   Up 8 hours   0.0.0.0:8080->8080/tcp   code-server
```

过程进行的还比较顺利，一步就成功了

# Nginx 配置

在Nginx的配置文件上加一个 `location` 的配置块

```conf
location /code-server/ {
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
    proxy_set_header Accept-Encoding gzip;
}
```

打开浏览器访问 `https://example.com/code-server`，出现输入框，输入刚才设置的密码，进入IDE

![]('../assets/images/vsocde-web-ide.png')
