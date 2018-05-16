// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const crypto = require('crypto')

// == utils ==
const getType = require('./getType')
const assert = require('./assert')

/**
 * 返回md5值
 * @param  {String} string
 * @return {String}
 */
module.exports = function md5 (string) {

  assert(getType(string) !== 'string', `md5's param must be a string.`)

  return crypto.createHash('md5').update(string).digest('hex')
}