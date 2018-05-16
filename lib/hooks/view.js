// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')
const fs = require('fs')

// == third-party ==
const glob = require('glob')
const ejs = require('ejs')
const pug = require('pug')

// == utils ==
const { deepMerge } = require('../utils')

const defaultViewConfig = {
  template: 'ejs',
  cache: true,
  ejs: {
    delimiter: '%',
    ext: '.ejs'
  },
  pug: {
    ext: '.pug'
  }
}

module.exports = (app, { appPath, viewDir, getViewPath }) => {

  const config = deepMerge.copy(defaultViewConfig, app.config.view)

  // 获取待匹配的路由表对应关系
  const matches = {}
  for (let viewDirPath of glob.sync(path.join(appPath, viewDir, '/'))) {
    // 相对 appPath 的 文件路径
    viewDirPath = path.join('/', path.relative(appPath, viewDirPath), '/')
    // 对应的 url 路径
    const viewPath = getViewPath.call(config, viewDirPath)
    // 存到 map 中
    Object.assign(matches, {[viewPath]: viewDirPath})
  }

  app.use( (ctx, next) => {
    ctx.render = ctx.response.render =
      renderTemplate(appPath, matches, config ).bind(ctx.response)
    ctx.renderToString = ctx.response.renderToString =
      renderTemplate(appPath, matches, config, true ).bind(ctx.response)

    return next()
  })
}

function matchPath (matches, viewPath) {
  for (let viewRootPath in matches) {
    const viewDirRootPath = matches[viewRootPath]
    const relativePath = path.relative(viewRootPath, viewPath)
    if (relativePath.indexOf('..') !== 0) return {
      viewDirRootPath, relativePath
    }
  }
  return null
}

const cache = {}
function renderTemplate (appPath, matches, config, toString) {

  const type = config.template
  const layout = config.layout
  const baseData = config.data

  config = config[type] || []

  const ext = config.ext || '.html'

  const template = {

    // ejs 模版处理
    ejs (viewPath, data) {
      const filePath = viewPath + ext

      if (config.cache && cache.hasOwnProperty(filePath)) {
        return cache[filePath](data)
      }

      const tpl = fs.readFileSync(filePath, 'utf8')
      const fn = ejs.compile(tpl, Object.assign(
        {filename: filePath}, config))

      if (config.cache) cache[filePath] = fn
      return fn(data)
    },

    // pug 模版处理
    pug (viewPath, data) {
      const filePath = viewPath + ext

      if (config.cache && cache.hasOwnProperty(filePath)) {
        return cache[filePath](data)
      }

      const tpl = fs.readFileSync(filePath, 'utf8')
      const fn = pug.compile(tpl, Object.assign(
        {filename: filePath}, config))

      if (config.cache) cache[filePath] = fn
      return fn(data)
    },

  }

  const render = template[type]
  if (!render) { throw 'template not supported' }

  return function (viewPath, data, viewConfig={}) {

    viewPath = path.join('/', viewPath)
    data = deepMerge.copy(baseData, data)

    const matched = matchPath(matches, viewPath)
    if (!matched) throw new Error(`template ${viewPath} not found.`)

    const { viewDirRootPath, relativePath } = matched

    const viewDir = path.join(appPath, viewDirRootPath, relativePath)
    let html = render(viewDir, data)

    const layoutPath = viewConfig.layout === undefined ?
      layout : viewConfig.layout

    if (layoutPath) {
      const matched = matchPath(matches, path.join('/', layoutPath))
      if (!matched) throw new Error(`template ${layoutPath} not found.`)

      const { viewDirRootPath, relativePath } = matched
      const layoutDir = path.join(appPath, viewDirRootPath, relativePath)

      html = render(layoutDir, Object.assign({}, data, {body: html}))
    }
    if (toString) return html
    Object.assign(this, { type: 'html', body: html })
  }
}