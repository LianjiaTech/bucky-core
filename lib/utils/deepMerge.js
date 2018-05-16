// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == utils ==
const getType = require('./getType')

const ObjectType = 'object'


/**
 * 深拷贝
 * @param  {...Object}  object
 * @return {Object}
 */
function deepMerge (...objects) {
  return objects.reduce((prev, curr) => _deepMerge(prev, curr))
}
function deepMergeCopy (...objects) {
  return deepMerge({}, ...objects)
}

function _deepMerge (object, anotherOject) {
  if (
    getType(object) !== ObjectType ||
    getType(anotherOject) !== ObjectType
  ) return object

  for (let name in anotherOject) {
    if (!anotherOject.hasOwnProperty(name)) continue
    let subObject = object[name]
    let anotherSubObject = anotherOject[name]

    const subObjectType = getType(subObject)
    const anotherSubObjectType = getType(anotherSubObject)

    if (anotherSubObjectType === ObjectType)
      anotherSubObject = Object.assign({}, anotherSubObject)

    if (
      !object.hasOwnProperty(name) ||
      subObjectType !== ObjectType ||
      anotherSubObjectType !== ObjectType
    ) {
      object[name] = anotherSubObject
      continue
    }
    _deepMerge(subObject, anotherSubObject)
  }
  return object
}

module.exports = Object.assign(deepMerge, {copy: deepMergeCopy})
