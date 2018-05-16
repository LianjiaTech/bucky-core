// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * 循环对象元素
 * @param  {Object}   object   Object, 最好是一个纯对象
 * @param  {Function} iteratee 循环函数
 * @return {Object}            类似Array.map 将 iteratee 返回的数据组成新对象
 */
module.exports = function objectForEach (object, iteratee) {
  let result = {}
  for (let key in object) {
    //如果是 Object.create(null) 创建的纯对象是没有 hasOwnProperty 的
    if (object.hasOwnProperty == undefined || object.hasOwnProperty(key))
      result[key] = iteratee(object[key], key, object)
  }
  return result
}