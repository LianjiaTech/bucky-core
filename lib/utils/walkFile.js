// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const fs = require('fs')
const path = require('path')

// == utils ==
const noop = require('./noop')

const defaultConfig = {
  deep: false,
  extname: '.js',
  skepStartWithUnderscore: true,
  skepStartWithDot: true
}

module.exports = function walkFile (
  dirPath = '',
  callback = noop,
  config = {}
) {
  config = Object.assign( {}, defaultConfig, config )

  try {
    if ( !fs.statSync(dirPath).isDirectory() ) return
  } catch (e) { return }

  // 先处理 index
  eachPath( path.join(dirPath, 'index' + config.extname) )

  // 在处理其他文件
  fs.readdirSync(dirPath).forEach(file => {
    if (file === 'index' + config.extname) return
    eachPath( path.join(dirPath, file) )
  })

  // 处理每个 path
  function eachPath (filePath) {

    // 检测是否文件或者文件夹
    let isFile = false
    let isDirectory = false
    try {
      const stat = fs.statSync(filePath)
      isFile = stat.isFile()
      isDirectory = stat.isDirectory()
    } catch (e) { return }

    const { dir, name, ext } = path.parse(filePath)
    // 是否以下划线开头
    const startWithUnderscore = name.indexOf('_') === 0
    // 是否以点开头
    const startWithDot = name.indexOf('.') === 0

    // 如果命中跳过规则，那么跳过
    if (config.skepStartWithUnderscore && startWithUnderscore) return
    if (config.skepStartWithDot && startWithDot) return

    if (isFile) {
      if (config.extname != ext) return
      callback( name === 'index' ? dir : filePath )
    }
    if (config.deep && isDirectory) walkFile(filePath, callback, config)
  }

}