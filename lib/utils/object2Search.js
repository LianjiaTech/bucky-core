// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == utils ==
const objectForEach = require('./objectForEach')
/**
 * 将 object 转化成 query
 * @param  {Object}  object
 * @param  {Boolean} encode
 * @return {String}
 */
module.exports = function object2Search (object, encode=true) {
  const array = []
  objectForEach( object, (value, key) => {
    // 处理为空的情况
    if (value === undefined || value === null) value = ''
    // 转换成字符串
    value = '' + value
    // 是否需要 uri 转译
    if (encode) value = encodeURIComponent(value)

    array.push({ key, value })
  })
  if (array.length === 0) return ''
  return '?' + array
    .sort(({value: value1}, {value: value2}) => value1.localeCompare(value2))
    .sort(({key: key1}, {key: key2}) => key1.localeCompare(key2))
    .map(({key, value}) => key + '=' + value)
    .join('&')
}