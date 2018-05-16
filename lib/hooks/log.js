// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')

// == third-party ==
const log4js = require('log4js')

// == utils ==
const { objectForEach, uuid, getType, formatDate } = require('../utils')

const commonConfig = {
  type: 'dateFile',
  pattern: '-yyyy-MM-dd',
  alwaysIncludePattern: false,
}
const defaultConfig = {
  access: Object.assign({
    filename: 'access.log',
    // 默认输出格式, 形参是可用的格式
    logFormatter: ({
      startTime,
      endTime,
      timeCost,   //  api 请求花费时间
      request,    //  api 的请求对象
      response    //  api 的返回对象
    }) => [
      timeCost,
      request.url,
      request.method,
      response.status
    ].join('|')
  }, commonConfig),
  api: Object.assign({
    filename: 'api.log',
    // 是否输出返回头
    isLogResponseBody: false,
    // 默认输出格式, 形参是可用的格式
    logFormatter: ({
      startTime,  //  api 请求开始时间
      endTime,    //  api 请求结束时间
      target,     //  api 请求的地址
      request,    //  api 的请求对象
      response    //  api 的返回对象
    }) => [
      endTime - startTime,
      request.method,
      target,
      response.status
    ].join('|')
  }, commonConfig),
  error: Object.assign({
    filename: 'error.log',
    // 默认输出格式, 形参是可用的格式
    logFormatter: error => [
      error.name,
      JSON.stringify(error.message),
      JSON.stringify(error.stack)
    ].join('|')
  }, commonConfig),
  application: Object.assign({
    filename: 'application.log',
    // 默认输出格式, 形参是可用的格式
    logFormatter: (type, message) =>
      `[${type}] ${JSON.stringify(message)}`
  }, commonConfig)
}

module.exports = app => {

  const config = app.config.log || {}

  const log4jsConfig = { appenders: [] }

  objectForEach(defaultConfig, (_, name) => {

    config[name] = Object.assign({}, defaultConfig[name], config[name])
    const filename = path.join(
      config.logPath,
      config[name].filename
    )

    log4jsConfig.appenders.push(
      Object.assign({ category: name }, config[name], { filename })
    )
  })

  log4js.configure(log4jsConfig)

  objectForEach(defaultConfig, (_, name) => {
    const event = 'log.' + name
    const logger = log4js.getLogger(name)
    const formatter = config[name].logFormatter
    process.on( event, (...args) => logger.mark( formatter(...args) ) )
  })


  app.use( (ctx, next) => {

    const startTime = Date.now()
    const { request, response } = ctx

    ctx.request.uuid = ctx.headers.UNIQID || uuid()
    ctx.request.sequence = 0

    return next().then(() => {
      const endTime = Date.now()
      process.emit('log.access', {
        request, response, startTime, endTime, ctx,
        uuid: ctx.request.uuid,
        sequence: ctx.request.sequence,
        timeCost: endTime - startTime
      })
    })
  })

  // 封装全局方法给业务用
  const Logger = global.Logger = (type, message, ...arg) => {

    if (message === undefined) {
      message = type

      // 获取调用 Logger 的地方
      const error = new Error()
      Error.captureStackTrace(error, Logger)
      const matched = error.stack.match(/\(([^\)]+)/)
      type = matched && matched[1]
    }
    if (arg.length) message = [message].concat(arg)
    process.emit('log.application', type, message)
  }
}