---
title: '快速上手React + graphql + apollo + node + express'
date: '2019-12-16'
---

# toc

旨在通过项目快速上手标题提到的几个技术内容

# 准备

* 需要node环境，版本大于10.0，建议使用nvm来安装node
* 包管理器可以是npm或者yarn
* vscode编辑器
* 源码：[https://github.com/zepang/practice-demo-with-graphql](https://github.com/zepang/practice-demo-with-graphql)

# 以下是 React + graphql + apollo + node + express 在项目中的逻辑关系

![](/images/react+graphql+apollo+node+express/work-follow.png)

项目分为两部分

* 客户端（react + apollo + graphql）

* 服务端（node + express + apollo + graphql) + 数据库

# 初始化项目

## 1. 新建项目目录

```shell
mkdir graphql-books

npm init -y
```

## 2. 安装react和react-dom

```shell
npm install react react-dom --save
```

为了尽量清楚的看到项目的内容，这里没有使用create-react-app这样的脚手架，所以接下来还需配置一下react项目的开发环境

## 3. 搭建react的开发环境

*  新建 `public/index.html`
  
react的项目和vue一样都是单页面应用，所以需要一个入口的页面文件，填入下面的内容。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Graphql-books</title>
</head>
<body>
  <!-- 跟节点 -->
  <div id="root"></div>
</body>
</html>
```

* 安装 webpack 和 webpack-dev-server

```shell
npm install webpack webpack-cli webpack-dev-server --save-dev
```

安装包的时候尽量安装最新的版本，如果遇到版本兼容问题，后面可以慢慢解决，之后的安装包也是一样的选择。

* 安装babel来处理js，jsx文件

处理jsx语法需要用到 `@babel/preset-react` 预设

```shell
npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react
```

根目录添加`.babelrc`文件，填入下面内容

```
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ]
}
```

这里需要注意的是`presets`的配置从最后一个开始执行的，也就是需要先处理jsx，然后再处理js。`plugins`的顺序相反。

* 安装babel-loader和 html-webpack-plugin

为了方便清除上一次输出的文件，顺便把 `clean-webpack-plugin`也安装一下

```shell
npm install --save-dev babel-loader html-webpack-plugin clean-webpack-plugin
```

创建`webpack.client.config.js`，填入以下内容：

```js
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/client/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  devServer: {
    port: 3000
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    })
  ]
}
```

最后在 `package.json` 文件中的"scripts"添加 `"start": "webpack-dev-server --progress --hot --config webpack.client.config.js"`。

* 运行本地开发命令

在 `src/client/index.js`填入下边内容：

```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(<App />, document.getElementById('root'))
```

创建 `src/client/App.js`，填入：

```js
import React, { Component } from 'react'

export default class App extends Component {
  render () {
    return(
      <div>Hello world!</div>
    )
  }
}

```

打开终端，进入根目录，运行`npm run start`，即可看到如下内容：

![](/images/react+graphql+apollo+node+express/hello-world.png)


我们发现终端控制台输出的内容较乱，可以通过安装并添加 `friendly-errors-webpack-plugin` 来清除一些不友好的提示：

```shell
npm install --save-dev friendly-errors-webpack-plugin
```

引入并在webpack plugins中添加如下内容：

```js
new FriendlyErrorsWebpackPlugin({
  clearConsole: true,
  compilationSuccessInfo: {
    messages: [`You application is running here http://localhost:${process.env.PORT}`]
  }
})
```

* 添加eslint

找一种大家比较认可使用广泛的规范的配置，比如`eslint-config-airbnb`

```shell
npx install-peerdeps --dev eslint-config-airbnb
```

这里使用了install-peerdeps进行安装，install-peerdeps可以安装依赖对等的依赖包，避免各种包版本不对出现兼容问题。

安装完成之后我们发现同时安装了如下包：

```shell
+ eslint-config-airbnb@18.0.1
+ eslint-plugin-react-hooks@1.7.0
+ eslint-plugin-jsx-a11y@6.2.3
+ eslint-plugin-react@7.16.0
+ eslint-plugin-import@2.18.2
+ eslint@6.1.0
```

使用如下命令，创建一个eslint的配置文件

```shell
npx eslint --init
```

选择 `to check syntax and find problems` 检查语法并找到问题，后面的自行选择

或者你不用提前安装包，直接使用 `npx eslint --init`，最后选择一种常用的配置，它自动会进行安装

由于我们这里使用了babel，所以还需要安装`babel-eslint`，避免babel转换的语法报错问题。

下边是我的eslint配置内容：

```js
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  // 使用 babel-eslint
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': 'off' // 习惯使用，不要求jsx一定要写在jsx文件中
  },
};
```

那么这样一来在写代码的时候，编辑器针对错误的格式自动给出提示，如果你想一次修复多个文件，那么你还可以在package.json中添加如下命令：

```json
"lint": "eslint src/client --fix",
```

* 额外的内容

**使用 properties initializer(直接声明类属性)**

在react中，通常声明state的一写法是：

```js
export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
}
```

这是官方文档上提供的写法，也符合咱们刚才配置的airbnb的eslint规则，state in constructor。

如果你觉得比较麻烦，你也可以直接用下边的写法：

```js
export default class App extends React.Component {
  this.state = {}
}
```

使用这种写法，需要添加 `@babel/plugin-proposal-class-properties` 这个包，因为目前js不支持这种写法。不要忘记在`.babelrc`中添加插件配置项

```json
"plugins": [
  "@babel/plugin-proposal-class-properties"
]
```

**一些必要的loader配置**

```js
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
  ],
},
{
  test: /\.(png|jpe?g|gif|svg)$/,
  loader: 'url-loader',
  options: {
    limit: 100000,
    fallback: {
      loader: 'file-loader',
      options: {
        name: 'static/[name].[hash:7].[ext]',
      },
    },
  },
},
```

自行安装对应的loader

## 4. 搭建node + graphql的后端的服务

关于graphql的基本概念，基本使用均可查询Graphql的官网[https://graphql.github.io](https://graphql.github.io)

关于graphql的实践应用的话，可以查下How to Graphql 这个网站[https://www.howtographql.com](https://www.howtographql.com)

* 开启express http 服务

```shell
npm install express --save
```

创建 `src/server/index.js`文件，填入如下内容:

```js
import express from 'express'

const app = express()

app.get('*', (req, res) => res.send('Hello world'))

app.listen(8000, () => console.log('Listening on port 8000!'))
```

在开发环境下自动重启应用，需要安装`nodemon`

```
npm install --save-dev nodemon
```

为了有更好的语法支持，我们还需要安装`@babel/node`

```
npm install --save-dev @babel/node @babel/core
```

在package.json中添加如下命令，并将之前start命令名称换成client：

```json
"server": "nodemon --exec babel-node src/server/index.js --watch"
```

这样就可以通过`npm run server`来启动express服务。

接下来添加一些常用的包

helmet: 安全

cors: 跨站访问

compression：压缩

```
npm install --save helmet cors compression
```

* 整合express和apollo

```
npm install --save apollo-server-express graphql graphql-tools
```

创建`src/server/services/graphql/index.js`,`src/server/services/graphql/schema.js`, `src/server/services/graphql/resolvers.js`

在 `graphql/index.js`中创建`apollo-server`实例并暴露

```js
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'

import Resolvers from './resolvers'
import Schema from './schema'

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

const server = new ApolloServer({
  schema: executableSchema,
  context: ({ req }) => req
})

export default server
```

然后，在`server/index.js`引入实例，并通过实例的`applyMiddleware`方法，以中间件的方式注册`graphql`服务。下边是`express-graphql`和`apollo-server-express`包注册`graphql`方式：

express-graphql

```js
const express = require('express')
const graphqlHTTP = require('express-graphql')

const app = express()
// ...
app.use('graphql', graphqlHTTP({
  // ...
}))
// ...
```

apollo-server-express

```js
const express = require('express')
const { ApolloServer } = require('apollo-server-express')

const app = express()
// ...
const server = new ApolloServer({
  // ...
})
server.applyMiddleware({app})
// ...
```

两种方式的效果是一样的。

* log日志收集

```
npm install winston
```

创建`src/server/helper/logger.js`文件，填入下边内容

```js
import winston from 'winston'

const transports = [
  new winston.transports.File({
    filename: 'error.log',
    level: 'error'
  }),
  new winston.transports.File({
    filename: 'combined.log',
    level: 'verbose'
  })
]

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

然后在需要使用的地方直接引入使用，例：`logger.log({ level: 'info', message: 'Post was created' })`，根据level的不同会收集到不同的文件中。

## 5. 链接数据库

* 安装本地mysql

根据不同的系统环境选择不同的安装方式，我这里使用的是ubuntu18.04，下边是安装步骤：

  1. 更新和升级系统包
  ```
  sudo apt-get update && sudo apt-get upgrade
  ```
  2. 安装MySQL、PHP、apache
  ```
  sudo apt-get install apache2 mysql-server php php-pear php-mysql
  ```
  安装完毕之后使用`sudo -i`进入root账户，运行下边命令
  ```
  mysql_secure_installation
  ```
  如果出现错误`Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock'`，请直接停止MySQL，然后重启：

  ```shell
  sudo service mysql stop
  sudo service mysql start
  <!-- 再次运行 -->
  mysql_secure_installation
  ```
  除了要注意设置密码之外，其他的不用管都可以

  然后通过 `mysql -u root` 进入MySQL的shell界面，创建一个本地开发的用户：

  ```
  GRANT ALL PRIVILEGES ON *.* TO 'devuser'@'%' IDENTIFIED BY 'devuser';
  ```

  1. 安装phpmyadmin
  ```
  sudo apt-get install phpmyadmin
  ```

  安装的时候需要注意，当让你选择web server的时候选择 apache2

  建立软链 
  
  ```
  sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
  ```

  通过浏览器访问`http://localhost/phpmyadmin`即可。如果遇到其他问题，请上网查阅资料。

* nodejs 链接数据库

连接数据库之前，需要创建数据库

打开phpmyadmin的sql面板，输入并执行下边语句

```
CREATE DATABASE graphbook_dev CHARACTER SET utf8 COLLATE utf8_general_ci;
```

安装对应的node包

```
npm install --save sequelize mysql2
```

新建`src/server/database/index.js`，填入下边内容：

```js
import Sequelize from 'sequelize'

const sequelize = new Sequelize('graphbook_dev', 'devuser', 'devuser', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})
```

关于`sequelize`的使用，可以去看看相关文档，如果你想快速上手一个东西，我觉得边学边用就好了。我们可以测试一下数据库能否连接，出现问题的话，请对照控制台的error信息自行解决。

```js
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })
```

通常根据环境的不同，需要更换数据库的连接配置。

创建`src/server/config/index.js`，添加`development`和`production`环境下的配置：

```js
module.exports = {
  development: {
    username: 'devuser',
    password: 'devuser',
    database: 'graphbook_dev',
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    host: process.env.host,
    username: process.env.username,
    password: process.env.password,
    database: process.env.database,
    logging: false,
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}
```

然后在`database/index.js`中引入配置项。

* models 的 migrations

创建`src/server/models`和`src/server/migrations`文件夹，分别存放sequelize的模型文件（models）和迁移文件（migrations）。

模型文件通常是用来定义模型和数据库表之间的映射。比如列字段类型，列字段校验等。

迁移文件记录了如何将数据库更新或者恢复到目标状态，你可以认为类似git这一类的版本工具的log记录。

关于sequelize的更多内容，请看sequelize的文档内容。

通常我们创建models或者migrations的时候，为了方便会使用sequelize-cli工具，通过工具提供的命令行命令来进行创建models和migrations文件。

```
npm install -g sequelize-cli
```

输入以下命令：

```
sequelize model:generate --models-path src/server/models --name Post --attributes text:text --migrations-path src/server/migrations
```

`src/server/models/post.js`

```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    text: DataTypes.TEXT
  }, {});
  Post.associate = function(models) {
    // associations can be defined here
  };
  return Post;
};
```

通过调用`sequelize.define`方法定义`Post`的模型，方法的第一个参数就是模型的名称，第二个参数是一个包含模型的属性和对应的数据类型的队形，第三个参数是配置对象。

```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      text: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Posts');
  }
};
```

migration文件主要有两个函数up和down。

up函数中记录的是当我们运行migration的时候的动作，上边的up函数会创建一个Posts表，然后定义id，text，createdAt，updatedAt列。

down函数会在回滚或者取消migration的时候执行，比如上面的down函数会取消我们创建的Posts表。

然后我们就创建了一个post的模型文件和迁移文件。

如果你看了sequelize的migration的部分文件内容，你就会知道，在运行migration之前还需要提供数据库的配置文件。正确的步骤是在项目的目录下使用`sequelize init` 命令来初始化创建以下会用的文件目录：

* config, contains config file, which tells CLI how to connect  with database
* models, contains all models for your project
* migrations, contains all migration files
* seeders, contains all seed files

我们之前通过手动的方式创建了这几个文件，就不需要通过命令再次创建了。

运行以下命令进行本次的迁移：

```
sequelize	db:migrate	--migrations-path	src/server/migrations	--config src/server/config/index.js
```

在`localhost/phpmyadmin`可以看到数据库已经创建了我们需要的Posts表：

![](/images/react+graphql+apollo+node+express/Posts-table.jpg)

虽然我们创建了model，但是我们并没有引入它们，现在需要将这些model在`src/server/models/index.js`中统一引入，添加如下代码：

```js
import fs from 'fs'
import path from 'path'

const basename = path.basename(__filename)

export default function getModels (sequelize) {
  const models = {}
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      const model = sequelize.import(path.join(__dirname, file))
      models[model.name] = model

      if (models[model.name].associate) {
        models[model.name].associate(models)
      }
    })
  return models
}
```
sequelize提供了`import`这个实例方法，以下是 `import` 方法的源码：

````js
import(importPath) {
  // is it a relative path?
  if (path.normalize(importPath) !== path.resolve(importPath)) {
    // make path relative to the caller
    const callerFilename = Utils.stack()[1].getFileName();
    const callerPath = path.dirname(callerFilename);

    importPath = path.resolve(callerPath, importPath);
  }

  if (!this.importCache[importPath]) {
    let defineCall = arguments.length > 1 ? arguments[1] : require(importPath);
    if (typeof defineCall === 'object') {
      // ES6 module compatibility
      defineCall = defineCall.default;
    }
    this.importCache[importPath] = defineCall(this, DataTypes);
  }

  return this.importCache[importPath];
}
````

主要就做了两件事，第一，防止重复引入model，用了一个importCache对象缓存了已经引入的model；第二，引入model文件的实际上是引入创建model的方法，这里直接调用了创建model的方法，并传入了需要的参数，返回当前的model对象。

然后我们在`src/server/database/index.js`中引入models，并作为暴露对象属性：

```js
// ...
import getModels from '../models'

// ...
const models = getModels(sequelize)

export default {
  ...models,
  sequelize,
  Sequelize
}
```

* seeders

当我们需要给数据库添加一些假数据或者初始化一些数据的时候，我们就需要用到seeder，这些数据通常也叫做种子数据。

sequelize-cli 为我们提供了seed命令，首先需要创建seeders文件夹，用来存放seeders，运行下边命令：

```
sequelize seed:generate --name fake-posts --seeders-path src/server/seeders
```

![](/images/react+graphql+apollo+node+express/seeder.png)

* 结合sequelize和apollo

用户通过graphql客户端发起一个query或者mutation的时候，都是通过字段对应的resolver里的逻辑来返回或者更新数据。目前，我们已经创建了db的，所以还需要将db引入到resolver函数中，让sequelize和apollo结合起来。

我们将db通过参数的方式传入到resolver里边，为此我们对以下几个文件做以下修改：

`src/server/graphql/resolvers`

```js
export default function resolver ({ db }) {
  const { Post } = db
  const resolvers = {
    RootQuery: {
      posts (root, args, context) {
        return Post.findAll({ order: [['createdAt', 'DESC']] })
      }
    },
    // ....
  }
  return resolvers
}
```

`src/server/graphql/index.js`

```js
export default (utils) => {
  const executableSchema = makeExecutableSchema({
    typeDefs: Schema,
    resolvers: resolver(utils)
  })

  const server = new ApolloServer({
    schema: executableSchema,
    context: ({ req }) => req
  })

  return server
}
```

`src/server/index.js`

```js
import graphql from './graphql'

export default (utils) => ({
  graphql: graphql(utils)
})
```

`src/server/index.js`

```js
// ...
import serviceLoader from './services'
import db from './database'

const services = serviceLoader({
  db
})
// ...
```

至此，已经正常的连接数据库

## 6. sequelize + graphql使用

* model关联关系

这里以user和post为例

首先需要创建user的model和migration

```
sequelize mode:generate --models-path src/server/models --name User --attributes avatar:string,username:string
```

为了建立user和post的关联，我们需要给post添加外键，这个外键为userId，创建一个添加外键的迁移：

```
sequelize migration:create --migrations-path src/server/migrations --name add-userId-to-post
```

* 添加外键

关于sequelize添加外键的语法，请查看文档，找到我们创建的迁移直接填入下面内容：

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Posts',
        'userId',
        {
          type: Sequelize.INTEGER
        }
      ),
      queryInterface.addConstraint('Posts', ['userId'], {
        type: 'foreign key',
        name: 'fk_user_id',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('Posts', 'fk_user_id', {}),
      queryInterface.removeColumn('Posts', 'userId')
    ])
  }
};
```

运行migration

```
sequelize db:migrate:all --migrations-path src/server/migrations --config src/server/config/index.js
```

如果出现报错，请运行下边的命令取消迁移

```
sequelize db:migrate:undo:all --migrations-path src/server/migrations --config src/server/config/index.js
```

我在写的时候出现因为数据库名称写错，但是又创建了外键，导致无法直接删除 userId 字段。在这种情况，如果sequelize提供的api无法取消迁移的情况下，请尝试直接使用数据库的shell，先删除外键，在删除列字段，一般情况下是不会出现这种情况的。

```
ALTER TABLE tbl_name DROP FOREIGN KEY fk_symbol;
ALTER TABLE Posts DROP userId;
```

* 关联model

除了给数据库添加外键之外，还需要通过sequelize提供的特定方式，关联对应的model。

比如这里的user和post，就是1对N的关系。

下边是sequelize的语法：

```js
// post.js
Post.associate = function(models) {
  // associations can be defined here
  Post.belongsTo(models.User)
};

// user.js
User.associate = function(models) {
  // associations can be defined here
  User.hasMany(models.Post)
};
```

另外这里纠正一个错误，我之前在`src/server/models/index.js`中引入models的写法有写问题，下边是修正的写法：

```js
export default function getModels (sequelize) {
  const models = {}
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      const model = sequelize.import(path.join(__dirname, file))
      models[model.name] = model
    })

  // 给associate函数传入的models必须是包含所有models的对象
  Object.keys(models).forEach(name => {
    if (models[name].associate) {
      models[name].associate(models)
    }
  })
  return models
}
```

虽然我们现在已经关联了user和post，但是目前数据库中user是没有数据，所以我们需要给user添加一些种子数据。另外，虽然之前已经添加了post的种子数据，但是userId并没有指定正确的userId。

首先将取消之前的post种子数据

```
sequelize db:seed:undo:all --seeders-path src/server/seeders --config src/server/config/index.js
```

然后删除之前的`xxxxxx-fake-post.js`文件，创建fake-user 种子数据：

```
sequelize seed:generate	--name	fake-users	--seeders-path	src/server/seeders
```

添加如下内容：

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      avatar: '/uploads/avatar1.png',
      username: 'TestUser',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      avatar: '/uploads/avatar2.png',
      username: 'TestUser2',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```

创建fake-posts种子数据：

```
sequelize seed:generate	--name	fake-posts	--seeders-path	src/server/seeders
```

添加如下内容：

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'SELECT id from Users;'
    ).then(users => {
      const usersRows = users[0]
      return queryInterface.bulkInsert('Posts', [{
        text: 'Lorem ipsum 2',
        userId: usersRows[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        text: 'Lorem ipsum 2',
        userId: usersRows[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Posts', null, {});
  }
};

```

删除在创建主要需要创建post种子数据的时候需要查询user，所以需要提前添加user数据

运行seed命令

```
sequelize db:seed:all --seeders-path src/server/seeders --config src/server/config/index.js
```

使用phpmyadmin查看一下结果

![](/images/react+graphql+apollo+node+express/userId-post.png)

![](/images/react+graphql+apollo+node+express/userId-user.png)

图中user的id和post的id是数据库自增的id，当我们使用迁移回滚的然后再创建数据的时候，这个id并不会从1开始，所以在创建post的种子数据的时候，提前使用了query查询了存在的user的id

接下来我们使用之前的query查询所有的post：

![](/images/react+graphql+apollo+node+express/insomnia-post-user-null.png)

然后我们发现post里边的user返回的结果是null，这是因为我们还没有定义post user 的 resolver。graphql会去查找没有字段对应的resolver，没有找到则会返回null。接下来在resolver中添加下边代码：

```js
export default function resolver ({ db }) {
  const { Post, User } = db
  const resolvers = {
    Post: {
      user (post, args, context) {
        return post.getUser()
      }
    },
    // ...
  }
  // ...
}
```
因为user和post的model已经进行的关联，所以可以使用post.getUser()获取当前文章的用户。然后再次查询，得到了正确的结果：

![](/images/react+graphql+apollo+node+express/insomnia-post-user.png)

接下来，我们继续改写addPost的resolver函数：

```js
addPost (root, args, context) {
  const { post } = args
  logger.log({ level: 'info', message: 'Post was created' })
  return User.findAll().then(users => {
    const usersRow = users[0]
    return Post.create({
      ...post
    }).then(newPost => {
      return Promise.all([
        newPost.setUser(usersRow.id)
      ]).then(() => {
        return newPost
      })
    })
  })
}
```
需要在创建post的时候，主动去给设置userId，用来关联user。

* 多对多关系

创建一个chat 模型和迁移

```
sequelize model:generate --models-path src/server/models --name Chat --attributes text:string --migrations-path src/server/migrations
```

在 chat 和 user 的model文件中添加多对多的关联

```js
 Chat.associate = function (models) {
  // associations can be defined here
  Chat.belongsToMany(models.User, { through: 'user-chat' })
}
```

```js
User.associate = function (models) {
  // associations can be defined here
  User.hasMany(models.Post)
  User.belongsToMany(models.Chat, { through: 'user-chat' })
}
```

多对多的关联需要通过另一个模型来进行关联

```js
Chat.belongsToMany(models.User, { through: 'user-chat' })
User.belongsToMany(models.Chat, { through: 'user-chat' })
```

sequelize会创建user-chat这个model，并具有userId和chatId这两个等效外键

但是sequelize不会自动去创建数据库表，所以我们还需要额外创建一张user-chat的表

```
sequelize migration:create --name create-user-chat --migrations-path src/server/migrations
```

并添加userId和chatId列：

```js
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserChat', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      chatId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserChat');
  }
};
```

使用迁移命令进行迁移

接下来我们创建一些种子数据：

```
sequelize seed:generate --name fake-chats --seeders-path src/server/seeders
```

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Chats', [{
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Chats', null, {});
  }
};
```

```
sequelize seed:generate --name fake-chats-uses-relations --seeders-path src/server/seeders
```

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const usersAndChats = Promise.all([
      queryInterface.sequelize.query('SELECT id from Users;'),
      queryInterface.sequelize.query('SELECT id from Chats;')
    ])

    return usersAndChats.then(rows => {
      const users = rows[0][0]
      const chats = rows[1][0]
      console.log(chats)
      return queryInterface.bulkInsert('user-chat', [{
        userId: users[0].id,
        chatId: chats[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        userId: users[1].id,
        chatId: chats[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user-chat', null, {})
  }
};
```

数据准备完毕，接下来我们给graphql添加对应的schemea

```js
`
// ...
type User {
  id: Int
  avatar: String
  username: String
  chats: [Chat]
}
type Chat {
  id: Int
  messages: [Message],
  users: [User]
}

type RootQuery {
  posts: [Post]
  chats: [Chat]
}
// ...
`
```

然后再添加对应resolver：

```js
{
  // ...
  User: {
    chats (user, args, context) {
      return user.getChats()
    }
  },
  Chat: {
    users (chat, args, context) {
      return chat.getUsers()
    }
  },
  RootQuery: {
    posts (root, args, context) {
      return Post.findAll({ order: [['createdAt', 'DESC']] })
    },
    chats (root, args, context) {
      return User.findAll().then(users => {
        if (!users.length) {
          return []
        }
        const usersRow = users[0]

        return Chat.findAll({
          include: [{
            model: User,
            required: true,
            through: { where: { userId: usersRow.id } }
          }, {
            model: Message
          }]
        })
      })
    }
  },
  // ...
}
```

下边是查询结果：

![](/images/react+graphql+apollo+node+express/chat-user.jpg)





## 7. react + graphql client

通过express + apollo server已经搭建起来的了一些后端接口服务。接下来进行需要使用react + apollo client搭建起前端的 graphql client。

* 使用 react 创建 apollo client

先来安装一些必要的包

```
npm install --save apollo-boost @apollo/react-hooks graphql
```

安装 `apollo-boot`相当于安装如下的包

```
npm install apollo-client apollo-cache-inmemory apollo-link-http apollo-link-error apollo-link graphql-tag --save
```

创建 `src/client/apollo/index.js`，实例化一个简单的apollo client

```js
import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql'
})

export default client
```

通过以下方式验证一下：

```js
import gql from 'graphql-tag'
client.query({
  query: gql`
  {
    posts {
      id
      text
      user {
        avatar
        username
      }
    }
  }
  `
}).then(res => console.log(res))
```

* 在react中使用 apollo client

`@apollo/react-hooks`为我们提供了一包裹层组件--`ApolloProvider`，和 react的 Context.Provider类似。

我们需要在最上层组件在包裹一层`ApolloProvider`，并提供`client`属性

```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloProvider } from '@apollo/react-hooks'
import client from './apollo/index.js'

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, document.getElementById('root'))
```

**在组件内使用 apollo client**

apollo提供了多种选择：

1. 直接使用刚才我们创建并暴露的client的实例方法，这种方式官方文档没有，所以不推荐
2. 使用`@apollo/react-hooks`，以第三方`hooks`的方式使用，这是目前最新官方文档提供并推荐的一种方式, [https://www.apollographql.com/docs/react/api/react-hooks/](https://www.apollographql.com/docs/react/api/react-hooks/)
3. 使用`@apollo/react-components`，以组件的方式来使用，[https://www.apollographql.com/docs/react/api/react-components/](https://www.apollographql.com/docs/react/api/react-components/)
4. 使用`@apollo/react-hoc`，类似于`react-redux`的`connect`组件，给每一个用到了 apollo client的组件，用高阶组件重新包装的方式来使用，[https://www.apollographql.com/docs/react/api/react-hoc/](https://www.apollographql.com/docs/react/api/react-hoc/)

这里先使用`@apollo/react-components`

创建`src/client/Feed.js`

```js
import React from 'react'
import { Helmet } from 'react-helmet'
import gql from 'graphql-tag'
import { Query, Mutation } from '@apollo/react-components'

import '../../assets/css/style.css'

const GET_POSTS = gql`{
  posts {
    id
    text
    user {
      avatar
      username
    }
  }
}`

const ADD_POST = gql`
mutation addPost($post: PostInput!) {
  addPost(post: $post) {
    id
    text
    user {
      username
      avatar
    }
  }
}`

export default class Feed extends React.Component {
  state = {
    postContent: ''
  }

  handlePostContentChange = (e) => {
    this.setState({
      postContent: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { posts, postContent } = this.state
    const newPost = {
      id: posts.length + 1,
      text: postContent,
      user: {
        avatar: (posts.length + 1) % 2 ? avatar1 : avatar2,
        username: `Fake User-${posts.length + 1}`
      }
    }
    this.setState((prevState) => ({
      posts: [newPost, ...prevState.posts],
      postContent: ''
    }))
  }

  render () {
    const { postContent } = this.state
    const self = this
    return (
      <div className="container">
        <Helmet>
          <title>Graphbook - Feed</title>
          <meta name="description" content="Newsfeed of all your all your friends on Graphbook"/>
        </Helmet>
        <div className="postForm">
          <Mutation mutation={ADD_POST}>
            {addPost => (
              <form onSubmit={e => {
                e.preventDefault()
                addPost({ variables: { post: { text: postContent } } })
                  .then(() => {
                    self.setState((prevState) => ({
                      postContent: ''
                    }))
                  })
              }}>
                <textarea
                  value={postContent}
                  onChange={this.handlePostContentChange}
                  placeholder="Write your custom post!"/>
                <input type="submit" value="Submit"/>
              </form>
            )}
          </Mutation>
        </div>
        <div className="feed">
          <Query query={GET_POSTS}>
            {({ loading, error, data }) => {
              if (loading) return 'loading ...'
              if (error) return error.message
              const { posts } = data

              return posts.map((post) => (
                <div className="post" key={post.id}>
                  <div className="header">
                    <img src={post.user.avatar} alt="" />
                    <h2>{post.user.username}</h2>
                  </div>
                  <div className="content">
                    {post.text}
                  </div>
                </div>
              ))
            }}
          </Query>
        </div>
      </div>
    )
  }
}
```

我这里演示了`Query`和`Mutation`两种组件的用法，更加详细的说明请查看文档。

需要注意的是这两种组件接受的子组件都是包含特殊参数的函数，不能是一般的子组件。

* 更新视图

当我们使用`Mutation`组件进行更新数据之后，列表展示的数据需要更新。

apollo 为我们提供了两种选择。

第一种是更新接口完成之后再次发出获取posts的query

```js
<Mutation 
  mutation={ADD_POST}
  refetchQueries={[{query:	GET_POSTS}]}>
</Mutation>
```

第二种是更新接口完成之后更新本地cache的数据

```js
<Mutation 
  mutation={ADD_POST}
  update={(store, { data: { addPost } }) =>{
    const data = store.readQuery({ query: GET_POSTS })
    data.posts.unshift(addPost)
    store.writeQuery({ query: GET_POSTS, data })
  }}>
  // ...
</Mutation>
```

**Optimistic UI**

Optimistic UI 是指在真事数据回来之前使用假数据来更新UI，一旦真实数据返回之后，立即使用真实的数据渲染UI并替换到假数据渲染的UI。

`@apollo/react-components`的`Mutation`组件为我们提供了一个属性`optimisticResponse`来实现这个效果，[https://www.apollographql.com/docs/react/performance/optimistic-ui/](https://www.apollographql.com/docs/react/performance/optimistic-ui/)。

```js
<Mutation
  // ...
  optimisticResponse={{
    __typename: 'mutation',
    addPost: {
      __typename: 'Post',
      text: postContent,
      id: -1,
      user: {
        __typename: 'User',
        username: 'Loading...',
        avatar: '/public/loading.gif'
      }
    }
  }}></Mutation>
```

其中`__typename`为我们定义在graphql的字段，其他的部分则是模拟的数据，结构需要和graphql定义的字段结构一致。

https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/networkStatus.ts

关于query和mutation的一些基本用法就这些，了解更多还是需要多看文档和案例。

## 安装 FontAwesome

下边是fontAwesome的github链接：
[https://github.com/FortAwesome/react-fontawesome#get-started](https://github.com/FortAwesome/react-fontawesome#get-started)

```
npm install --save @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
```

文档上提供了两种引入方式，因为我们想在整个项目中使用，所以使用library的方式引入，创建`src/components/fontawesome.js`文件，填入如下内容：

```js
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

library.add(faAngleDown)

```

然后在`App.js`中引入，这样就可以保证我们在所有的自定义组件中使用

```js
import './components/fontawesome'

```

当你需要完整的图标时，你需要安装

# 前端相关的包

* react-helmet

*This reusable React component will manage all of your changes to the document head.*

比如用来改变HTML的title和description

```
npm install --save react-helmet
```

# React开发需要主要的地方

### 绑定事件的时候this指向

我是建议统一使用建通函数方式声名函数，使用的时候也不需要使用bind进行绑定。

