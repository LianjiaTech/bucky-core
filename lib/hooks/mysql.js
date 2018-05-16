// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == thrid-party ==
const mysql = require('mysql')

// == utils ==
const { getType, objectForEach, promisify } = require('../utils')

module.exports = app => {

  const configs = app.config.mysql || {}

  const MySQL = {}
  objectForEach(configs, (config, name) => {
    // 建立 mysql 链接池
    const pool = mysql.createPool(config)

    // 挂载 MySQL 的全集变量
    MySQL[name] = callback => {
      return new Promise((resolve, reject) => {
        // 创建链接
        pool.getConnection((error, connection) => {
          if (error) return reject(error)
          // 建立包装给使用者
          const wrap = connectionWrapper(connection)
          resolve(callback(wrap).then(result => {
            objectForEach( wrap, (_, name) => delete wrap[name] )
            connection.release() // 释放链接
            return result
          }))
        })
      })
    }
  })

  global.MySQL = Object.assign({}, global.MySQL, MySQL)
}

/**
 * 包装 connection
 * 事物方法没有封装经历，应该大部分场景用不到
 * @param  {Object} connection
 * @return {Object}
 */
const connectionSyncFunctions = [ 'escape', 'escapeId', 'format' ]
const connectionAsyncfunctions = [ 'changeUser', 'query', 'ping', 'statistics' ]

function connectionWrapper (connection) {
  const wrap = { originalConnection: connection }
  for (let name of connectionSyncFunctions) {
    wrap[name] = connection[name].bind(connection)
  }
  for (let name of connectionAsyncfunctions) {
    wrap[name] = promisify(connection[name], connection)
  }
  return wrap
}