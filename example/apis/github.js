export default api => {

  api.config = {
    // 接口超时时间
    timeout: 10000,

    // 默认的返回值简单约定， {code: , data:, msg:} 的形式返回
    // 如果是这种返回形式的话，那么通过下面参数，做接口检查
    codeKey: 'code',
    dataKey: 'data',
    messageKey: 'msg',
    successCode: 1,

    // 如果不是上面的形式
    responseHandler (res) {
      // res 是 node-fetch 的返回值
      let errors = null
      if (res.statusCode === 200) {
        const json = JSON.parse(res.body)
        if (json.errors) {
          errors = json.errors
        } else {
          return json
        }
      }
      if (errors) {
        try { errors = JSON.stringify(errors) } catch (e) {}
        throw new Error.APIError({ message: errors, url: res.url})
      }
    },

    // 接口的协议，域名，端口
    base: 'https://api.github.com',

    // 接口请求数据格式
    // 一下可选
    // multipart/form-data
    // application/json
    // application/x-www-form-urlencoded
    contentType: 'application/x-www-form-urlencoded',

    // query 参数的值是否需要 encode
    queryEncode: false,
  }

  // 定义接口
  api('searchRepositories', {

    // 接口 path
    uri: '{search}/repositories',

    // 接口访问方式
    method: 'get',

    // 接口参数检查
    parameters: {
      q: api.type.string.required,
      sort: api.type.string.required,
      order: api.type.string.required
    },

    // 是否使用缓存
    // 简单的缓存设置， 写使用的 redis 名即可
    // cache: 'cache',

    // 如果想自定义，可以使用下面的
    cache: {
      redis: 'cache',
      expire: 60,
      key: req => req.method === 'GET' ? req.uri : null,
      fromCache: cache => JSON.parse(cache),
      toCache: data => JSON.stringify(data)
    }
  })

  // api(....) 继续定义下一个接口
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = api => {}

// 测试环境配置
export const testing = api => {}