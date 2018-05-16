`
   __                __
  |  |--.--.--.----.|  |--.--.--.
  |  _  |  |  |  __||    <|  |  |
  |_____|_____|____||__|__|___  |
                          |_____|
  with ♥︎ by lianjia-fe
`
const path = require('path')

require('babel-polyfill')
require('babel-core/register')({
  presets: ["es2015", "stage-0"],
  only: /example/
})

const applicationPath = '/applications'
const applicationPathLen = applicationPath.length

require('../lib')({
  // 项目根目录路径
  appPath: path.resolve(__dirname),

  // 项目 config 目录路径
  configPath: '/configs',

  // 项目 action 目录路径
  actionDir: applicationPath + '/*/actions',
  getActionPath: dir => path.join(dir.substring(applicationPathLen), '..'),

  // 项目 socket 目录路径
  socketDir: applicationPath + '/*/sockets',
  getSocketPath: dir => path.join(dir.substring(applicationPathLen), '..'),

  // 项目 api 目录路径
  apiDir: applicationPath + '/*/apis',
  getAPIPath: dir => dir.substring(applicationPathLen).split('/')[1],

  // 项目 model 目录路径
  modelDir: applicationPath + '/*/models',
  getModelPath: dir => dir.substring(applicationPathLen).split('/')[1],

  // 项目 静态文件夹 路径
  staticDir: applicationPath + '/*/statics',
  getStaticPath: dir => path.join(dir.substring(applicationPathLen), '../public'),

  // 项目 模版渲染 路径
  viewDir: applicationPath + '/*/views',
  getViewPath: dir => path.join(dir.substring(applicationPathLen), '..'),
})
.lift()