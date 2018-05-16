// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * 获取 package.json
 * @return {Object}
 */

// == native modules ==
const fs = require('fs')
const path = require('path')

module.exports = function getPkg (appPath = process.cwd()) {

  appPath = path.join('/', appPath)

  while (appPath != '/') {
    const pkgPath = path.join(appPath, 'package.json')
    if ( fs.existsSync(pkgPath) ) return require(pkgPath)
    appPath = path.dirname(appPath)
  }
  return null
}