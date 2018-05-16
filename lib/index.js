// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
'use strict'

// == native modules ==
const path = require('path')

// == third-party ==
const Koa = require('koa')

// == utils ==
const { getType, assert, string2Array } = require('./utils')

const hooks = `
  config, error, log, response, view, rewrite, static,
  mysql, redis, api, model, socket, service, action, lift
`

const defaultConfig = {
  appPath: process.cwd(),

  configPath: '/configs',

  actionDir: '/actions',
  getActionPath: () => '/',

  socketDir: '/sockets',
  getSocketPath: () => '/',

  apiDir: '/apis',
  getAPIPath: () => '',

  modelDir: '/models',
  getModelPath: () => '',

  staticDir: '/statics',
  getStaticPath: () => '/public',

  viewDir: '/views',
  getViewPath: () => '/',
}

module.exports = function (config) {

  if (getType(config) !== 'object') config = { appPath: config }
  // 应用默认值
  config = Object.assign({}, defaultConfig, config)

  // app 是一个 Koa 实例
  const app = new Koa()

  // 初始化的错误收集数组，如果有错误，收集在这边
  app.initErrors = []

  // 挂载 hooks
  for ( let name of string2Array(hooks) ) {
    try {
      require( path.join(__dirname, 'hooks', name) )(app, config)
    } catch (error) { app.initErrors.push(error) }
  }

  // 错误捕获
  app.on('error', (error) => process.emit('log.error', error))
  // 打印启动时的错误日志
  process.on('lift', () => {
    if (app.initErrors.length === 0) return

    console.log('\nError during initialization:\n')

    for (let error of app.initErrors) {
      const message = error.toString()
      console.log(
        error.stack.indexOf(message) === 0 ?
          error.stack : message + '\n' + error.stack
      + '\n')
      process.emit('log.error', error)
    }
  })

  return app
}