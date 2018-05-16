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

  // 是否使用模版缓存
  cache: false,

  // ejs 的配置
  ejs: {
    compileDebug: false,
    delimiter: '%',
    ext: '.ejs'
  },
  pug: {
    compileDebug: false,
    ext: '.pug'
  }

}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {
  ejs: {
    compileDebug: true
  },
  pug: {
    compileDebug: true
  },
}
// 测试环境配置
export const testing = {}