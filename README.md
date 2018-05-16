# Bucky

> 基于 koa 开发的 node 框架
> with ♥︎ by lianjia-fe

```
     __                __
    |  |--.--.--.----.|  |--.--.--.
    |  _  |  |  |  __||    <|  |  |
    |_____|_____|____||__|__|___  |
                            |_____|
    with ♥︎ by lianjia-fe
```

## 使用方式

通过 bucky-cli 生成你的项目 参见 `https://github.com/LianjiaTech/bucky-cli`

之后通过下面命令启动

```
$ npm install
$ npm run dev
```

## 项目结构

```
your-project
├── bin            // 上线 op 启动脚本
└── src            // 项目目录
    ├── actions    // 动作
    ├── apis       // 接口
    ├── configs    // 配置
    ├── models     // 数据对象
    ├── responses  // 返回封装
    ├── services   // 插件
    └── views      // 模版
```

## CONFIG

> bucky 很多工作都可以使用配置完成，配置的设置会分布在各个地方
> 需要了解 配置中环境的覆盖特征

通过 configs/nev 中可以设置当前的环境，默认使用 process.env.NODE_ENV 来外部注入

下面是 configs/app 的例子

```
import prodConfig from './_prod'

export default {

  name: PKG.name,

  // 项目监听的端口
  port: prodConfig.base.PORT,

  // 是否全局绑定 lodash
  _: true,

  // 是否前端有代理
  // 如果你的server 前面还有 nginx 等的代理则选择 true
  proxy: true
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {
  port: 3000,
  proxy: false
}
// 测试环境配置
export const testing = {
  port: 3000,
  proxy: false
}
```

在 default, development, testing 中可以写不同的配置。

+ 在 production 环境中 配置为 default
+ 在 development 环境中 配置为 default + development
+ 在 testing 环境中 配置为 default + testing

数据是 两个数据的 __深度__ merge 得到的。


## API

> api 用于数据接口调用，规定数据格式和调用方式

在 apis 目录中添加配置文件，会自动生成api

可以通过 `bucky api myAPI` 创建

```
export default api => {

  api.config = {
    // 接口超时时间
    timeout: 10000,

    // 默认的返回值简单约定， {code: , data:, msg:} 的形式返回
    // 如果是这种返回形式的话，那么通过下面参数，做接口检查
    codeKey: 'code',
    dataKey: 'data',
    messageKey: 'msg',

    // 可以使用以下方法 处理 api 请求前的数据
    // requestHandler () {}

    // 可以使用以下方法 处理 api 返回的数据
    // responseHandler () {}

    // 当 [codeKey] === [successCode] 是认为请求成功
    successCode: 100000,

    // 接口的协议，域名，端口
    base: 'http://[domain]:[port]',

    // 上行格式 可以是:
    // application/x-www-form-urlencoded
    // multipart/form-data
    // application/json
    // 等等
    // contentType: 'application/x-www-form-urlencoded'
  }

  // 定义接口 这边的设置是在 config 基础上的
  // 内部的没有点的值复用 config 中的
  api('__api_name__', {

    // 接口 path, 可以使用 {xxx} 的方法动态修改 uri
    // 在请求的 uriReplacer 参数设置
    uri: 'i/{am}/a/path',

    // 接口访问方式 get | post | delete | put ...
    method: 'get',

    // 接口参数检查
    parameters: {
      // string: api.type.string.required,
      // number: api.type.number.required
    },

    // 是否使用缓存
    // 简单的缓存设置， 写使用的 redis 名即可
    // cache: 'cache',
    // 如果想自定义，可以使用下面的
    // cache: {
    //   redis: 'cache',
    //   key: req => req.method === 'GET' ? req.uri : null,
    //   fromCache: cache => JSON.parse(cache),
    //   toCache: data => JSON.stringify(data)
    // }
  })

  // api(....) 继续定义下一个接口
}
```
生成完之后，你可以用以下的方式调用

```
await API.[文件名].[定义接口名](data, option)
```

参数定义:

+ `data` {Object}: 接口请求参数，通过不同的 method，作为 search 或者 body
+ `option` {Object}: 可选 配置
    + `query` {Object}: 可选 post或着其他将data转化为body的时候动态加一些 query
    + `uriReplacer` {Object}: 可选 可以替换uri上 {xxxx} 中的值，动态修改uri
    + `queryEncode` {Boolean}: 可选 默认true  是否将 query 中的 value 做 encodeURIComponent


## Model

> Model 用于构建数据对象

在 models 目录中添加配置文件

可以通过 `bucky model MyModel` 创建

model 的命名必须首字母大写（通过 bucky-cli 会自动给你转化首字母），必须是个类

```
export default class MyModel {

  // 实例初始化方法
  constructor () {}

  // 静态方法
  static staticFunction () { }

  // 静态同步方法
  static async staticAsyncFunction () { }

   // 实例方法
  staticFunction () { }

  // 实例同步方法
  static async asyncFunction () { }
}
```

## Action

> action 是最终业务实现。一个业务对应一个action

在 actions 目录中添加配置文件

可以通过 `bucky action /my/path/here` 创建

在没有其他干扰的情况下， action 文件的目录路径即为访问路径


__action 在 configs/action 有一些配置__

+ `defaultAction`: action 中的默认值


__一个action的配置__

```
export default {

  // csrf 作用是判断来访者身份，如果是 false 不会判断
  // 默认操作是，如果是 post, put, delete 操作，并且 来访者 域名和当前域名不匹配则会拒绝访问
  // 如果 csrf 为 字符串 或者 字符串 数组（可以是minimatch），则相当于设置白名单，白名单中的会被认可
  // csrf: false,
  // csrf: [
  //  '*.lianjia.com',    // minimatch
  //  'aaa.lianjia.com',  // 域名
  //  '*',  // 匹配所有
  //  ''    // 允许 空 referer
  //  ],


  // cors 是否允许 异步跨域访问
  // cors: '*',
  // cors: 'http://lianjia.com',
  // cors: {
  //  origin: 'http://lianjia.com',
  //  methods: 'GET, POST',
  //  Headers: 'X-Requested-With'
  // },

  // 如果路由命中则会走这个方法
  // 可以在 rewrite redirect 修改路由指向
  async handler (ctx) {

    // ctx 为 koa 的 context 上下文
    // 详见: http://koajs.com/#context

    // ctx.request  为 koa request 对象
    // 详见: http://koajs.com/#request

    // ctx.response 为 koa response 对象
    // 详见: http://koajs.com/#response

    // 使用 ctx.request.query 获取 url query 参数
    // 使用 ctx.request.body 获取通过 x-www-form-urlencoded 方式提交的 body
    // 使用 ctx.request.form 获取 formData 方式提交的 form 表单

    // 使用 ctx.user 获取当前用户信息 (登陆的情况下)
    // 使用 ctx.isAppWebView() 可以获取到是否在 link 或者 掌链 中

    // 使用 API.xxx, Model.xxx 调用 api model 中声明的 接口 和 类

    // 使用 ctx.render 渲染模版
    // 默认使用 ejs, 可以在 config/view 中设置
    // ctx.render('index', { title: 'bucky' })

    // 页面未找到
    // ctx.notFound()

    // 页面无权限
    // ctx.forbidden()

    // 页面跳转
    // ctx.redirect('http://lianjia.com')

    // 页面跳转(使用js方式)
    // ctx.redirect('http://lianjia.com', {viaJavascript: true})

    // 系统错误，并且报错
    // ctx.serverError(new Error('server error'))

    // ajax 返回
    // ctx.ajax({greeting: 'hello world'})

    // ajax 返回异常
    // ctx.ajax(null, {error: true, message: '加载失败'})
  },

  // 如果 handler 代码出错，可以在 catchError 中捕获处理错误
  // 如果没有 catchError, 则会自动抛 500 错误，并返回错误内容
  // async catchError (ctx, error) { },
}
```

## Response

> response 是对数据返回的封装

默认封装为

__ctx.notFound() 返回页面不存在 使用 404.ejs 模版渲染空页面__

__ctx.forbidden() 返回页面没权限  使用 403.ejs 模版渲染空页面__

__ctx.serverError(error) 返回页面服务错误 使用 500.ejs 模版渲染空页面__

+ `error` {Error} 错误对象

__ctx.redirect(url, {viaJavascript}) 返回页面需要跳转 使用 302.ejs 模版渲染空页面__

+ `url` {String} 跳转的页面地址
+ `viaJavascript` {Boolean} 是否使用 javascript 的方式跳转

__ctx.ajax(data, {error, message}) 渲染 ajax 数据返回（json）__

+ `data` {Any} 可选 返回数据对象
+ `error` {Boolean|Any} 可选 是否错误（默认错误类型）， 制定错误类型 （错误类型在 configs/response 中规定）
+ `message` {Any} 可选 错误的描述

__ctx.jsonp(data, {error, message, handlerKey}) 渲染 jsonp 数据返回（json）__

+ `data` {Any} 可选 返回数据对象
+ `error` {Boolean|Any} 可选 是否错误（默认错误类型）， 制定错误类型 （错误类型在 configs/response 中规定）
+ `message` {Any} 可选 错误的描述
+ `handlerKey` {String} 可选 jsonp 钩子的 query 的 key

__ctx.render(templatePath, data, {layout})__

+ `templatePath` {String} 对应的 views 目录下的文件的路径，从 views 算 relative 路径
+ `data` {Object} 渲染模版的数据
+ `layout` {False|String} 渲染模版外层layout模版（false为没有）

## View

> view 是模版渲染的模版的存放位置

可以在 configs/view 中设置模版引擎配置

```
export default {

  // 你想使用的模版类型，默认是 ejs
  template: 'ejs',

  // 项目 外层框架的模版 位置 （相对于 views 文件夹）
  layout: 'layout',

  // 拼装模版数据，在这边写，每次都会带上
  // 可以在这边定义 静态文件的版本号 之类的东西
  data: {
    title: 'bucky'
  },

  // ejs 的配置
  ejs: {
    compileDebug: false,
    delimiter: '%',
    ext: '.ejs'
  }

}
```

## 跳转

> 跳转规则设置

可以修改 configs/redirect 和 configs/rewrite 来修改跳转，

区别是 redirect 是通过 302 来实现的， rewrite 是通过内部修改 url 的情况实现的。

在 rewrite 中可以通过 `ctx.originalUrl` 为转化之前的 url

```
export default [

  // rewrite 规则
  // 动态改变 url 让其走到对应的路由
  // 是 app 内部逻辑
  // 规则从上到下，如果匹配则不会再往下走了

  // from 可以是 正则，方法，字符串
  // 当url 被 正则匹配 或 方法返回非空 或 字符串匹配 minimatch
  // 则会走到对应的 to
  // to 可以是字符串，也可以是方法
  // 如果是方法 参数接收 正则匹配的match值， 方法返回值， 字符串是否匹配的布尔值
  // 返回为 字符串

  // 这个例子是改写 页面图标 的路由
  { from: '/favicon.ico', to: '/public/favicon.ico' }

]
```

## Redis

> 设置 redis 配置

```
export default {

  // 配置一个名为 "cache" 的 redis
  // 参见 http://redis.js.org/#api-rediscreateclient
  cache: {
    host: '127.0.0.1',
    port: '6379',
  }

}
```

__使用__

可以通过对应配置中 redis 名称，在全局 Redis.[redis 名称] 来获取对应的 redis 使用池
在会掉闭包中执行redis命令， 不需要释放 redis 句柄

记得对应的 async await 的使用
具体 redis 命令 查看 http://devdocs.io/redis/

```
const result = await Redis.cache(async redis => {
  await redis.hset(cacheKey, name, value)
  return await redis.hget(cacheKey, name)
})
```

__hashCache__

因为常见的 redis 使用是缓存，所以可以使用封装的 hashCache 方法，更加简单调用

```
await Redis.cache.hashCache.get('some_name', 'some_value')
await Redis.cache.hashCache.set('some_name')
```

通过 hashCache 使用默认的 redis key 存储对象
你可以通过 name_space 来区分存储 hash 池

```
await Redis.cache.hashCache('name_space').get('some_name', 'some_value')
await Redis.cache.hashCache('name_space').set('some_name')
```


## MySQL

> 设置 MySQL 配置

```
export default {

  // 配置一个名为 "store" 的 mysql
  // 参见 https://www.npmjs.com/package/mysql#pooling-connections
  store: {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'test'
  }

}
```

__使用__

可以通过对应配置中 mysql 名称，在全局 MySQL.[mysql 名称] 来获取对应的 mysql 使用池
在会掉闭包中执行mysql命令， 不需要释放 mysql 句柄

记得对应的 async await 的使用

```
const items = await MySQL.store(async store => {
  return await store.query(`select * from pet where name='${name}'`)
})
await MySQL.store(async store => {
  await store.query(`insert into pet(type, name) values('${type}','${name}')`)
})
```
可以使用 https://www.npmjs.com/package/sql 来声称 sql语句。 更加方便，并且避免sql注入

## 插件 service

> 书写自定义 koa 插件，也可以改造现有 koa 插件进来


## Lodash

当在 configs/app.js 中设置 `_: true`, 即 全局中 `_` 即位 lodash 句柄，哪都可以用


## 已经封装的功能

### App Web View

通过 `ctx.appWebView` 或者 `ctx.request.appWebView` 方法获取

+ `ctx.appWebView()` 判断目前是在 link 或者 链家app 中
+ `ctx.appWebView('link')` 判断目前是在 link 中
+ `ctx.appWebView('link')` 判断目前是在 链家app 中

### Form Parse / Body Parse

+ 如果 接口通过 'multipart/form-data' 或者 'application/octet-stream' 等方式发送的 formData 请求，请使用 `ctx.form` 或者 `ctx.request.form` 方式获取，如果是文件类型，返回是stream

+ 如果 接口通过 'application/x-www-form-urlencoded' 或者 'application/json' 等方式请求的，请使用 `ctx.body` 或者 `ctx.request.body` 方式获取(该方式不可能是文件)


### Static Server （静态资源）

设置 `configs/static.js`

```
export default {

  // 静态路径
  staticPath: '/public',

  // 静态文件夹路径
  staticDir: path.resolve(__dirname, '../statics'),

  // 文件是否返回 etag 头
  etag: true,

  // 文件是否返回 Last-Modified 头
  lastModified: true,

  // 用户客户端缓存时间
  maxAge: 60
}
```

## 默认 Models

### Utils

Model.Utils 提供一些可使用的方法集合

+ __appendSearch__ 往 uri 上追加 search
 * @param  {Object}  object
 * @param  {Boolean} encode
 * @return {String}

+ __assert__ 错误检查，如果命中抛异常
 * @param  {Boolean} 错误检查
 * @param  {String}  输出信息模版
 * @param  {...any}  模版的参数

+ __request__ requset 库

+ __requestAsync__ 异步 request 封装，同 requset 库

+ __escapeHTML__ 转移 HTML 特殊字符
 * @param  {String}
 * @param  {String}

+ __deepMerge__ 深拷贝
 * @param  {Object}
 * @param  {Object}
 * @param  {Object}

+ __formatPath__ 格式化 url 路径
 * @param  {String}
 * @return {String}
 *
 * /fsdfsd/fdsfdsf//fds///dfsds/ => /fsdfsd/fdsfdsf/fds/dfsds

+ __getPkg__  获取 package.json
 * @return {Object}

+ __getType__  getType 获取对象类型
 * @param  {any}    object
 * @return {string} boolean|number|string|function|array|date|regexp|object|error

+ __isIP__ 是否是 ip 格式
 * @param  {String}
 * @param  {Boolean}

+ __match__ 匹配字符串
 * @param  {String} string
 * @param  {Regexp|Function|String} rule
 * @param  {Any} 给 Function 类型的 rule 添加参数
 * @return {any}

+ __md5__ 返回md5值
 * @param  {String} string
 * @return {String}

+ __noop__ 空方法

+ __object2Search__ 将 object 转化成 query
 * @param  {Object}  object
 * @param  {Boolean} encode
 * @return {String}

+ __objectForEach__ 循环对象元素
 * @param  {Object}   object   Object, 最好是一个纯对象
 * @param  {Function} iteratee 循环函数
 * @return {Object}            类似Array.map 将 iteratee 返回的数据组成新对象

+ __promisify__ 将 node callback 方式转化成 promise 的方式
 * @param  {Function}   originalFunction
 * @param  {any}        context
 * @param  {Boolean}    returnMulitArgs
 * @return {Promise}

+ __string2Array__ 转换字符串到数组
 * @param  {String}   string
 * @param  {String}   spliter
 * @return {Array}

+ __uuid__ 获取随机 id
 * @return {String}

## 测试部署

确保测试的 node 环境 >= 6.4.4

推荐测试安装 [pm2](https://www.npmjs.com/package/pm2) 进行管理 node 服务，在 测试机 使用 `npm install -g pm2` 的方式安装。

测试可以通过 `pm2 list`, `pm2 start`, `pm2 delete` 等命令管理服务，简单明了。

安装完 pm2 后，通过如下代码启动 node 服务（测试环境）

```
pm2 delete <项目名，测试自己定，不要和其他项目重复就可以>
cd  <项目源码目录>
pm2 start npm --name "<项目名，测试自己定，不要和其他项目重复就可以>" -- run test
```

如果 pm2 命令找不到，请自行做下映射关系 /usr/local/node/bin/pm2 -> pm2

## 上线部署

1. __需要注意__，在 `configs/_prod.js` 文件，这个文件会读取 op 服务的配置。需要修改 `hostName` 变量为你的上线文件夹名（基本是你上线域名），其他代码一般不需要修改。

2. 线上是通过 `bin/run.js` 启动服务的，而不是 npm script。一般这个文件不需要做修改。已经统一配置了。

## 推荐第三方 node modules

### [moment](https://www.npmjs.com/package/moment)

> `npm install moment`

A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.

### [mathjs](https://www.npmjs.com/package/mathjs)

> `npm install mathjs`

Math.js is an extensive math library for JavaScript and Node.js. It features a flexible expression parser with support for symbolic computation, comes with a large set of built-in functions and constants, and offers an integrated solution to work with different data types like numbers, big numbers, complex numbers, fractions, units, and matrices. Powerful and easy to use.

### [accounting-js](https://www.npmjs.com/package/accounting-js)

> `npm install accounting-js`

accounting-js is a tiny JavaScript library for number, money and currency parsing/formatting. It's lightweight, fully localisable, has no dependencies, and works great client-side or server-side. Use standalone or as a nodeJS/npm and AMD/requireJS module.

