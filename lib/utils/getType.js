// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * getType 获取对象类型
 * @param  {any}    object
 * @return {string} boolean|number|string|function|array|date|regexp|object|error
 */

const assert = require('./assert')
const string2Array = require('./string2Array')
const objectForEach = require('./objectForEach')
const stream = require('stream')

const types = string2Array(`
  Boolean, Number, String, Function,
  Array, Date, RegExp, Object, Error
`)

function isBuffer (object) {
  return typeof Buffer !== 'undefined' &&
    !!Buffer.isBuffer &&
    Buffer.isBuffer(object)
}

function isStream (object) {
  return object instanceof stream.Stream
}

function getType (object) {
  if (object === null) return object + ''
  if (isBuffer(object)) return 'buffer'
  if (isStream(object)) return 'stream'

  let type = typeof object
  return type === 'object' || type === 'function' ?
    class2type[_toString.call(object)] || 'object' : type
}

const class2type = {}
const _toString = class2type.toString
for (let item of types) class2type[`[object ${item}]`] = item.toLowerCase()


/**
 * getTypeChecker 返回类型检查器
 * @param  {string|undefined} type 类型
 * @return {boolean}
 */
function typeChekcer (type) {

  // 判断入参， 必须是 字符串 或者 undefined
  assert(
    getType(type) !== 'string' && type !== undefined,
    'param must be string or undefined'
  )
  let checker
  if (type) {
    checker = any => {
      if (any === null || any === undefined) return true
      return checker.required(any)
    }
    checker.required = any => getType(any) === type
    return checker
  } else {
    checker = any => true
    checker.required = any => type !== undefined
  }
  return checker
}

function some (...checkers) {
  checkers = checkers.map(
    one => getType(one) === 'function' ? one : typeChekcer(one)
  )
  return any => checkers.some(one => one(any))
}

function objectOf (checkerMap) {
  checkerMap = objectForEach(checkerMap,
    one => getType(one) === 'function' ? one : typeChekcer(one)
  )
  const objectOfChekcer = any => {
    if (getType(any) !== 'object') return false
    for (let name in checkerMap) {
      if (checkerMap[name]( any[name] ) === false) return false
    }
    return true
  }
}

function arrayOf (checker) {
  return any => {
    if (getType(any) !== 'array') return false
    for (let item in any) {
      if (checker(item) === false) return false
    }
    return true
  }
}

module.exports = Object.assign(getType, {
  checker: typeChekcer, some, objectOf, arrayOf
})