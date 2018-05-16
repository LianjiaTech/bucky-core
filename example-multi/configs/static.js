// 这个文件是在 servers/static.js 中代码的配置
// 所有自定义的 server 都会给对应 configs 下同名的配置文件

export default {
  // 是否开启静态资源服务
  enable: true,

  // 是否加 etag
  etag: true,

  // 是否加 lastModified
  lastModified: true,

  // maxAge 事件 (秒)
  maxAge: 10,

  // 是否使用 bucky-mix
  mix: true,
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {}
// 测试环境配置
export const testing = {}