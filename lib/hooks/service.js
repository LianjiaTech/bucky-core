// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')

// == utils ==
const { walkFile, string2Array } = require('../utils')

const defaultIndex = 100

function wrapperService (service) {
  return function (ctx, next) {
    return service(ctx, next).catch(error => {
      ctx.response.serverError(error)
    })
  }
}

module.exports = (app, { appPath }) => {

  const config = app.config || {}

  // 获取 services 路径
  const serviceDirPath = path.join(appPath, 'services')

  const list = []
  // 保留bodyparser formparser logviewer
  list[defaultIndex] = string2Array(`
    bodyparser, formparser, logviewer
  `).map(name => {
    return require('../services/' + name)(config[name], app, app.io)
  })

  // 获取 services
  walkFile(serviceDirPath, filePath => {
    const { name } = path.parse(filePath)

    let service
    try { service = require(filePath) } catch (error) {
      app.initErrors.push(error)
      return
    }
    const serviceCreater = wrapperService(service.default(config[name]))

    let serviceIndex = parseInt(service.index, 10)
    serviceIndex = isNaN(serviceIndex) ? defaultIndex : serviceIndex

    if (list[serviceIndex] === undefined) list[serviceIndex] = []
    list[serviceIndex].push(serviceCreater)
  })

  // 执行 services
  for (let item of list) {
    if (!item) continue

    for (let service of item) {
      if (service) app.use( wrapperService(service) )
    }
  }
}