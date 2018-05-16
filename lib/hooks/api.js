// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')
const url = require('url')

// == third-party ==
const glob = require('glob')

// == utils ==
const {
  walkFile, deepMerge, getType,
  assert, objectForEach, requestAsync, md5,
  object2Search, appendSearch,
} = require('../utils')

/**
 * 默认的 cache 设置
 * @type {Object}
 */
const defaultCache = {
  expire: 60 * 5,
  key: req => req.method === 'GET' ? req.uri : null,
  fromCache: cache => JSON.parse(cache),
  toCache: data => JSON.stringify(data)
}

const defaultAPIConfig = {}

module.exports = (app, { appPath, apiDir, getAPIPath }) => {

  const onInitError = error => app.initErrors.push(error)
  const { env, api: appAPIConfig } = app.config
  const config = deepMerge.copy(defaultAPIConfig, appAPIConfig)

  const API = config => createAPI(config)

  const apiDirPaths = glob.sync(path.join(appPath, apiDir, '/'))

  for (let apiDirPath of apiDirPaths) {
    // 一个API文件对应多个业务API
    const apiRootPath = getAPIPath.call(config,
      path.join('/', path.relative(appPath, apiDirPath), '/')
    )
    //index中默认是'' 也就是apis下
    walkFile(apiDirPath, filePath => {
      // 获取根据 appPath 的相对路径
      // 拿到申明的api文件名称
      let {name} = path.parse(path.relative(appPath, filePath))
      // 通过用户方法返回 path
      const apiPath = path.join(apiRootPath, name)
      // 创建 api
      const apis = {}
      objectForEach(
        requireAPI(filePath, env, onInitError),
        (config, name) => {
        const displayName = `${apiPath}: ${name}`
        const api = createAPI(Object.assign({}, config, { displayName }))
        // 因为是暴露出去的，所以不让修改
        Object.assign(apis, { get [name] () { return api } })
      })
      // 挂机 api
      // 因为是暴露出去的，所以不让修改
      Object.assign(API, { get [apiPath]() { return apis } })
    })
  }

  // 挂载到 global
  if (global.API === undefined) {
    // 因为是暴露出去的，所以不让修改
    Object.assign(global, {get ['API'] () { return API } })
    return API
  }
  return Object.assign(global.API, API)
}
/**
 * 引入API文件，合并环境变量配置
 * @param {String} filePath api文件相对路径 
 * @param {String} env api当前环境
 * @param {Function} onError 抓取错误handler
 */
function requireAPI (filePath, env, onError) {
  let configCreaters
  try { configCreaters = require(filePath) } catch (error) {
    if (onError) onError(error)
    return {}
  }

  // 默认环境配置
  const {
    configMap: defaultConfigMap,
    baseConfig: defaultBaseConfig
  } = createConfig(configCreaters.default)

  // 特殊环境配置
  const {
    configMap: envConfigMap,
    baseConfig: envBaseConfig
  } = createConfig(configCreaters[env])

  const baseConfig = deepMerge.copy(defaultBaseConfig, envBaseConfig)
  const configMap = deepMerge.copy(defaultConfigMap, envConfigMap)

  return objectForEach(configMap, config => deepMerge.copy(baseConfig, config))
}

function wrapper (fileName, configs) {
  return objectForEach( configs, (config, name) => {
    const displayName = `${fileName}: ${name}`
    return createAPI(Object.assign({}, config, { displayName }))
  })
}
/**
 * 从 config 创建 api
 * @param  {Object} config
 * @return {Promise}
 */
function createAPI (config) {
  let {
    // 请求
    timeout = 500,
    base = '',
    queryEncode = true,
    contentType = 'application/x-www-form-urlencoded',
    uri = '',
    method = 'get',
    parameters = {},
    requestHandler = defaultRequestHandler,  // 请求发起前的处理时机
    responseHandler = defaultReponseHandler, // 请求返回后的处理时机
    responseEncoding = 'utf8',
    cache = false, // 缓存
    proxy //代理
  } = config

  method = method.toUpperCase()

  // 格式化 cache 对象
  if (getType(cache) === 'string') cache = { redis: cache }
  if (cache) cache = Object.assign({}, defaultCache, cache)

  return (data={}, options={}) => {

    let { query={}, headers={}, uriReplacer={}, ctx } = options

    // 根据 parameters 做接口数据的类型检查
    objectForEach(parameters, (checker, name) => {
      const value = data[name]
      assert(checker(value) !== true,
        'api parameter check error at %s with parameter "%s": %s',
        config.displayName, name, JSON.stringify(value)
      )
    })

    // requestOptions 是发起请求的数据对象
    const requestOptions = {
      uri,     // 请求地址
      method,  // 请求的方法
      timeout, // 请求超时时间
      proxy,   // 设置请求代理

      encoding: responseEncoding,
      // 处理 请求头
      headers: Object.assign({
        'Content-Type': contentType,
        'User-Agent': 'fe-node-webserver'
      }, headers)
    }

    // 处理请求数据
    if (~['GET', 'HEAD', 'OPTIONS'].indexOf(method)) {
      query = Object.assign({}, query, data)
    } else {
      // 处理 body 数据
      switch (contentType) {
        case 'multipart/form-data':
          requestOptions.formData = objectForEach(data, value => {
            if (getType(value) !== 'stream') return value
            const options = {
              filename: value.filename,
              contentType: value.mimeType
            }
            return { value, options }
          })
          break
        case 'application/json':
          requestOptions.body = JSON.stringify(data)
          break
        case 'application/x-www-form-urlencoded':
          requestOptions.form = data
          break
        default:
          requestOptions.body = data
      }
    }

    // 拼装 uri
    requestOptions.uri = appendSearch(
      // 通过 uriReplacer 填补 uri 中 {maker} 的数据
      url.resolve(base,
        uri.replace(/\{\s*([^\}]+)?\s*\}/g, (_, mark) => uriReplacer[mark])),

      // 处理 search
      object2Search(query, queryEncode)
    )

    // 添加 requestHandler 时机
    return Promise.resolve(requestHandler.call(config, requestOptions, ctx))
      .then(requestOptions => {

      // 拼装 cache 参数
      const cacheKey = cache && cache.key(requestOptions)
      const hashCache =
        cache && Redis[cache.redis] && Redis[cache.redis].hashCache('APICache')

      if (cache && cacheKey && hashCache) {
        return hashCache.get(md5(cacheKey)).then(result => {
          if (result !== null) return cache.fromCache(result)
          return doRequest(requestOptions)
        }).catch(error => {
          // 获取缓存失败
          process.emit('log.error', error)
          return doRequest(requestOptions)
        })
      } else {
        return doRequest(requestOptions)
      }

      // 请求发起 人间大炮一级准备
      function doRequest (requestOptions) {

        const catchError = error => {
          error = error || {}
          error.message += ' with uri: ' + requestOptions.uri
          Object.assign(error, requestOptions)
          process.emit('log.error', error)
          return Promise.reject(error)
        }

        const sequence = ctx ? ++ctx.request.sequence : null
        const uuid = ctx ? ctx.request.uuid : null

        const startTime = Date.now()
        return requestAsync(requestOptions)
          .catch(catchError)
          .catch(error => {
            const endTime = Date.now()
            // 如果错误也记录日志
            // 记录日志
            process.emit('log.api', {
              startTime, endTime, sequence, uuid,
              timeCost: endTime - startTime,
              target: requestOptions.uri,
              request: requestOptions,
              response: { statusCode: `ERROR( ${error.message} )` },
              ctx
            })
            return Promise.reject(error)
          })
          .then(response => {
            const endTime = Date.now()

            // 记录日志
            process.emit('log.api', {
              startTime, endTime, sequence, uuid,
              timeCost: endTime - startTime,
              target: requestOptions.uri,
              request: requestOptions,
              response: response,
              ctx,
            })
            // 添加 responseHandler 时机
            return Promise.resolve(responseHandler.call(config, response, ctx))
              .catch(catchError)
              .then(result => {
              if (cache && cacheKey && hashCache) {
                Promise.resolve(cache.toCache(result))
                  .then(result => hashCache.set(md5(cacheKey), result, {
                    expire: cache.expire
                  }))
                  .catch(error => process.emit('log.error', error))
              }
              return result
            })
          })
      }
    })
  }
}

/**
 * 创建 config
 * @param  {Function} fn
 * @return {object}
 */
function createConfig (fn) {
  if (getType(fn) !== 'function')
    return { configMap: null, baseConfig: null }

  // 类型检查器
  const typeCheckers = {
    string: getType.checker('string'),
    number: getType.checker('number'),
    boolean: getType.checker('boolean'),
    array: getType.checker('array'),
    object: getType.checker('object'),
    buffer: getType.checker('buffer'),
    stream: getType.checker('stream'),
    any: getType.checker(),

    some: getType.some,
    arrayOf: getType.arrayOf,
    objectOf: getType.objectOf
  }

  // 处理 api config 解析
  const configMap = {}
  const api = (name, apiConfig) => {
    // 重复检查
    assert(name in configMap, 'API named with "%s" is existed.', name)
    configMap[name] = apiConfig
  }

  fn(Object.assign(api, {
    type: typeCheckers,  // 类型检查器
    config: {}           // 存放默认值
  }))
  return { configMap, baseConfig: api.config }
}

/**
 * 默认的 requestHandler 设置
 * @param  {req}     request 的 req 参数
 * @return {any}
 */
function defaultRequestHandler (req) { return req }

/**
 * 默认的 reponseHandler 设置
 * @param  {res}     request 的 res
 * @return {any}
 */
function defaultReponseHandler (res) {

  const uri = res.request.uri.href

  // 检查 http code
  assert(res.statusCode !== 200,
    'api response statusCode error(%s) with uri: %s',
    res.statusCode, uri
  )

  const { codeKey, dataKey, messageKey, successCode } = this
  const {
    [codeKey]: code,
    [dataKey]: data,
    [messageKey]: message
  } = JSON.parse(res.body)

  // 检查 code
  const error = assert.assertError(code !== successCode,
    'api response code error(%s) with uri: %s',
    code, uri
  )

  if (error) throw Object.assign(error, {
    uri, code, data, message: message || error.message
  })

  return data
}