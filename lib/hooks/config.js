// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')

// == utils ==
const {
  getPkg, walkFile, getType, deepMerge, assert, objectForEach
} = require('../utils')

module.exports = (app, { appPath, configPath }) => {

  // 获取 config 路径
  const configDirPath = path.join(appPath, configPath)

  // app.config
  const config = app.config = app.config || {}

  config.appPath = appPath

  // 尝试获取 env 在 config/app.js 下
  let env = ''
  try { env = require(path.join(configDirPath, 'env.js')).default } catch (error) {
    app.initErrors.push(error)
  }
  global.ENV = config.env = env

  // 挂载 package.json
  global.PKG = config.pkg = getPkg(appPath)

  // 抓到所有的config文件
  const configFiles = {}
  walkFile(configDirPath, filePath => {
    configFiles[path.parse(filePath).name] = filePath
  })

  // configs/app.js 必须存在
  assert(!configFiles.app, 'configs/app.js need existed.')

  // 先加载 app.js
  loadConfig('app', configFiles.app)
  // ==== 处理必须在加载模块前事先处理的东西 ====
  // 加载 lodash
  if (app.config.app._ === true) global._ = require('lodash')
  // 设置 app 是否存在代理
  if (!!app.config.app.proxy) app.proxy = true
  // ==== /处理必须在加载模块前事先处理的东西 ====

  delete configFiles.app
  // 加在其他配置
  objectForEach( configFiles, (file, name) => {
    try { loadConfig(name, file) } catch (error) {
      app.initErrors.push(error)
    }
  })

  // 加载配置文件
  function loadConfig (name, path) {
    const config = require(path)
    // 如果内容是对象，那么认为是多环境的
    app.config[name] = getType(config.default) === 'object' ?
      // default 线上环境， 然后 merge 一个当前环境的补丁
      deepMerge({}, config.default, config[env]) :
      config.default
  }
}