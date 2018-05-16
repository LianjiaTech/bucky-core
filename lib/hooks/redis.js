// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const EventEmitter = require('events').EventEmitter

// == thrid-party ==
const redis = require('redis')

// == utils ==
const { getType, objectForEach, promisify } = require('../utils')

const defaultConfig = {
  // redis key 前缀
  prefix: PKG.name + ':',
  // 如果 redis 断开则不等待
  enable_offline_queue: false
}

module.exports = app => {

  const configs = app.config.redis || {}
  const Redis = {}

  objectForEach(configs, (config, name) => {
    const client = redis.createClient(Object.assign({}, defaultConfig, config))

    // 检测 redis 的可用性
    client.on('error', error => process.emit('log.error', error))

    Redis[name] = callback => {
      const wrap = radisClientWrapper(client)
      return callback(wrap).then(result => {
        objectForEach( wrap, (_, name) => delete wrap[name] )
        return result
      })
    }

    const hashCache = hashCacheCreater.bind(null, client)

    Redis[name].hashCache = Object.assign(hashCache, hashCache())
  })

  global.Redis = Object.assign({}, global.Redis, Redis)
}

/**
 * 对简单的 hashCache 的缓存方式的简单封装
 * @param  {Object} client
 * @param  {String} key
 * @return {Object > Function}
 */
function hashCacheCreater (client, key='HashCache') {

  const cbCreater = (resolve, reject) => (err, result) => {
    err ? reject(err) : resolve(result)
  }

  const parseOptions = options => Object.assign({
    JSONParse: false, uriEncode: false
  }, options)

  return {
    // hashCache.set
    set (name, value, options) {
      name = key + '/' + name
      options = parseOptions(options)

      if (options.JSONParse) value = JSON.stringify(value)
      if (options.uriEncode) value = encodeURIComponent(value)

      return new Promise((resolve, reject) => {
        client.set(name, value, cbCreater(resolve, reject))
        if (options.expire) client.expire(name, options.expire)
      })
    },
    // hashCache.get
    get (name, options) {
      name = key + '/' + name
      options = parseOptions(options)

      return new Promise((resolve, reject) => {
        client.get(name, cbCreater(resolve, reject))
      }).then(value => {
        if (options.uriEncode) value = decodeURIComponent(value)
        if (options.JSONParse) value = JSON.parse(value)
        return value
      })
    }
  }
}


/**
 * 对 redis client 对象的封装，支持 async await 方式调用
 * @param  {object} client
 * @return {object}
 */
const radisClientNowrap = { multi: true, batch: true }
const radisClientIgnoreCommend = ['quit', 'end', 'unref']

function radisClientWrapper (client) {
  const wrap = {}

  objectForEach(radisClientNowrap, (_, key) => {
    wrap[key] = cmds => {
      const handler = client[key](cmds)
      handler.exec = promisify(handler.exec, handler)
      return handler
    }
  })
  objectForEach( client, (any, key) => {
    wrap[key] = getType(any) === 'function' ? any.bind(client) : any
  })

  Object.assign(wrap, {
    get originalClient () { return client },
    get connected () { return client.connected },
    get retry_delay () { return client.retry_delay },
    get retry_backoff () { return client.retry_backoff }
  })

  objectForEach(EventEmitter.prototype, (fn, key) => {
    if (getType(fn) !== 'function') return
    wrap[key] = fn.bind(client)
  })

  objectForEach(Object.getPrototypeOf(client), (fn, key) => {
    if (radisClientNowrap[key]) return
    if (radisClientIgnoreCommend.indexOf(key.toLowerCase()) >= 0) return
    wrap[key] = promisify(fn, client)
  })

  return wrap
}

