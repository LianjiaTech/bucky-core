// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')
const url = require('url')

// third-party
const glob = require('glob')

// == utils ==
const { walkFile, string2Array, deepMerge, capitalize } = require('../utils')


const defaultModelConfig = {}

module.exports = (app, { appPath, modelDir, getModelPath }) => {

  const { env, model: appModelConfig } = app.config
  const config = deepMerge.copy(defaultModelConfig, appModelConfig)

  // 获取 config 路径
  const modelDirPaths = glob.sync(path.join(appPath, modelDir, '/'))

  // 挂载到 global
  const Model = global.Model = global.Model || {}
  // 只保留Utils
  string2Array(`Utils`).map(name => {
    Model[capitalize(name)] = require('../models/' + name)
  })
  for (let modelDirPath of modelDirPaths) {

    const modelRootPath = getModelPath.call(config,
      path.join('/', path.relative(appPath, modelDirPath), '/')
    )

    // 引用业务 models
    walkFile(modelDirPath, filePath => {
      const { name } = path.parse(filePath)
      const modelName = path.join(modelRootPath, capitalize(name))
      try { Model[modelName] = require(filePath).default } catch (error) {
        app.initErrors.push(error)
      }
    })
  }
}