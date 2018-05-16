// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * [assert 错误检查，如果命中抛异常]
 * @param  {Boolean} 错误检查
 * @param  {String}  输出信息模版
 * @param  {...any}  模版的参数
 */

function assert (...args) {
  const error = assertError(...args)
  if (error) throw error
}

function assertError (expression, message, ...args) {
  if (expression !== true) return
  let index = 0
  message = message.replace(
    /%s/g, () => parseValue(args[index++])
  )
  return new Error(`Bucky: ${message}`)
}

function parseValue (value) {
  try { return JSON.stringify(value) } catch (e) { return value + '' }
}

module.exports = Object.assign(assert, { assertError })