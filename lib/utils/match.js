// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == third party ==
const minimatch = require('minimatch')

// == utils ==
const getType = require('./getType')

/**
 * 匹配字符串
 * @param  {String} string
 * @param  {Regexp|Function|String} rule
 * @param  {Any} 给 Function 类型的 rule 添加参数
 * @return {any}
 */
module.exports = function match (string, rule, params) {

  let matched = null

  switch ( getType(rule) ) {
    case 'regexp':
      matched = string.match(rule)
      if (!matched) return null
      matched[0] = string
      return matched

    case 'function':
      matched = rule(string, params)
      if (matched == null) return null
      return [string].concat(matched)

    case 'string':
      matched = minimatch(string, rule)
      return matched ? [string] : null

    default: return null
  }
}