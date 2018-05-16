export default {

  enable: true,  // 是否开启 socket 功能

  server: {
    // socket.io 配置
    // path: '/socket.io'
  }

}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {}
// 测试环境配置
export const testing = {}