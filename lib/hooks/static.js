// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')
const fs = require('fs')

// == third-party ==
const glob = require('glob')

// == utils ==
const { md5, deepMerge } = require('../utils')

const defaultStaticConfig = {
  etag: true,
  lastModified: true,
  maxAge: 10,
  mix: false,
}

module.exports = (app, { appPath, staticDir, getStaticPath }) => {

  const config = deepMerge.copy(defaultStaticConfig, app.config.static)

  // 获取待匹配的路由表对应关系
  const matches = {}
  for (let staticDirPath of glob.sync(path.join(appPath, staticDir, '/'))) {
    // 相对 appPath 的 文件路径
    staticDirPath = path.join('/', path.relative(appPath, staticDirPath), '/')
    // 对应的 url 路径
    const staticPath = getStaticPath.call(config, staticDirPath)
    // 存到 map 中
    Object.assign(matches, {[staticPath]: staticDirPath})
  }

  app.use((ctx, next) => {
    // url 路径
    const requestPath = ctx.request.path

    for (let staticPath in matches) {
      // 根据 url 路径匹配到文件路径
      const staticDirPath = matches[staticPath]
      // 获取到对应 staticPath 的相对路径
      const relativePath = path.relative(path.join('/', staticPath), requestPath)
      // 如果路径是当前路径下
      if (relativePath.indexOf('..') !== 0) {
        return staticHandler(staticDirPath, relativePath, config)
      }
    }
    return next()

    /**
     * 走文件路由
     * @param  {path}   相对文件路由根目录
     * @param  {path}   对于根目录的相对地址
     * @param  {object} static 配置
     * @return {promise}
     */
    function staticHandler (staticDirPath, relativePath) {

      const { etag, lastModified, maxAge, mix } = config

      // 处理 字符格式转换（中文的文件名什么的）
      relativePath = relativePath.split('/').map(string => {
        try { string = decodeURIComponent(string) } catch (error) {}
        return string
      }).join('/')

      // 获取文件绝对路径
      let filePath = path.join(appPath, staticDirPath, relativePath)

      // 处理mix的特殊操作
      if (mix) {
        try {
          const mixStaticDirPath = path.join(appPath, staticDirPath, '.mix')
          if (fs.statSync(mixStaticDirPath).isDirectory()) {
            filePath = path.join(mixStaticDirPath, relativePath)
          }
        } catch (error) {}
      }

      let stat
      try { stat = fs.statSync(filePath) } catch (error) {}

      // 如果对应的不是文件，返回404
      if (!stat || !stat.isFile())
        return Promise.resolve(ctx.response.notFound())

      ctx.status = 200
      // 文件类型
      ctx.type = path.parse(relativePath).ext

      if (etag)
        ctx.set('ETag', getETag(stat))

      if (lastModified)
        ctx.set('Last-Modified', getLastModified(stat))

      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Cache-Control', `public, max-age=${maxAge}`)
      ctx.set('Expires', new Date(Date.now() + maxAge * 1000).toUTCString())

      // 判断是否走 304
      if (!ctx.query.nocache && ctx.request.fresh) {
        ctx.status = 304
      } else {
        ctx.body = fs.createReadStream(filePath)
      }
      return Promise.resolve()
    }
  })
}

/**
 * 计算 etag
 * @param  {stat} stat
 * @return {string}
 */
function getETag (stat) {
  return `${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}`
}

/**
 * 计算 LastModified
 * @param  {stat} stat
 * @return {string}
 */
function getLastModified (stat) {
  return stat.mtime.toUTCString()
}