// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')
const url = require('url')

// == third-party ==
const glob = require('glob')
const minimatch = require('minimatch')

// == utils ==
const {
  getType, walkFile, noop, formatPath,
  objectForEach, deepMerge, capitalize
} = require('../utils')

const generateErrorAction = error => ({
  default: {
    handler (ctx) {
      return Promise.resolve(ctx.serverError(error))
    }
  }
})
const defaultActionConfig = {
  defaultAction: {
    handler (ctx) {
      return Promise.resolve(ctx.notFound())
    }
  }
}
// 传入的app config
module.exports = (app, { appPath, actionDir, getActionPath }) => {

  const onInitError = error => app.initErrors.push(error)

  const { env, action: appActionConfig } = app.config
  const config = deepMerge.copy(defaultActionConfig, appActionConfig)

  const { defaultAction } = config

  // 获取所有的 action 路径, 可以有多个 action 路径
  const actionDirPaths = glob.sync(path.join(appPath, actionDir, '/'))

  // 路由表
  const routerMap = {}
  // 搜寻可以成为 action 的文件目录
  for (let actionDirPath of actionDirPaths) {

    const routeRootPath = getActionPath.call(config,
      path.join('/', path.relative(appPath, actionDirPath), '/')
    )

    walkFile(actionDirPath, filePath => {
      // 获取根据 appPath 的相对路径
      const {dir, name} = path.parse(path.relative(actionDirPath, filePath))
      // 通过用户方法返回 path
      const routePath = formatPath(path.join(routeRootPath, dir, name))
      // 创建 action
      const action = wrapperHandler(deepMerge.copy(
        { path: routePath },
        defaultAction,
        requireAction(filePath, env, onInitError)
      ))
      // 挂机 action
      Object.assign(routerMap, { [routePath]: action })
    }, { deep: true })
  }
  // 如果页面访问不存在，那么出 404 页面

  app.use(ctx => {
    // 获取路径的路由表
    const action = routerMap[ formatPath(ctx.request.path) ]
    return action ? action(ctx) : Promise.resolve( ctx.response.notFound() )
  })
}

function requireAction (filePath, env, onError) {
  let action
  try { action = require(filePath) } catch (error) {
    action = generateErrorAction(error)
    if (onError) onError(error)
  }
  return deepMerge.copy(action.default, action[env])
}

function wrapperHandler (config) {
  let {
    beforeHandler = noop, // 声明周期 before
    handler = noop,       // 声明周期 action
    catchError,           // 声明周期 catch-error
    csrf, // 防止 csrf
    cors  // 设置跨域请求
  } = config

  if (getType(cors) === 'string') cors = { origin: cors }

  function checkCSRF (ctx) {
    const { method, hostname, headers } = ctx.request
    const referer = headers.referer

    if (csrf === false) return false
    if (['POST', 'DELETE', 'PUT'].indexOf(method) < 0) return false

    const refname = referer ? url.parse(referer).hostname : ''

    const allowed = [ hostname ].concat(csrf || [])

    return !allowed.some( rule => minimatch(refname, rule) )
  }

  return function wrapper (ctx) {

    if ( checkCSRF(ctx) ) {
      ctx.response.forbidden('CSRF verification failed Request aborted')
      return Promise.resolve()
    }

    if (cors && cors.origin) {
      objectForEach(cors, (value, type) => {
        ctx.response.set('Access-Control-Allow-' + capitalize(type), value)
      })
    }

    if (ctx.request.method === 'OPTIONS') {
      ctx.response.status = 204
      return Promise.resolve()
    }

    return beforeHandler.call(config, ctx)
      .then(allowed => {
        if (allowed !== false) return handler.call(config, ctx)
      })
      .catch( error => {
        return catchError ?
          catchError.call(config, ctx, error) : Promise.reject(error)
      })
      .catch(error => {
        process.emit('error', error)
        ctx.response.serverError(error)
      })
  }
}