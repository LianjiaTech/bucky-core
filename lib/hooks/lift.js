// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// 启动监听端口
module.exports = (app, { appPath }) => app.lift = function lift (callback) {

  const port = this.config.app.port //从配置读取端口，src/configs/app.js
  const base = `http://0.0.0.0:${port}`

  this.listen(port || 80, () => {
    prointLogo()

    console.log(`Server lifted in ${c.cyan}${appPath}${c.end}`)
    console.log(`Environment: ${c.cyan}${this.env}${c.end}`)
    console.log(`To see your app, visit ${c.cyan}${base}${c.end}`)

    { // logviewer 相关
      const { enable, path } = this.config.logviewer || {}
      if (enable === true && path.length) {
        console.log(`To debug your app, visit ${c.cyan}${base}${path}${c.end}`)
      }
    }

    console.log('To shut down, press <CTRL> + C at any time.\n')

    process.emit('lift')
    callback && callback.call(app)
  })
}

const c = { cyan: '\x1b[36m', red: '\x1b[31m', end: '\x1b[39m' }

const prointLogo = () => console.log(`
 __                __
|  |--.--.--.----.|  |--.--.--.
|  _  |  |  |  __||    <|  |  |
|_____|_____|____||__|__|___  |
                        |_____|
with ${c.red}♥︎${c.end} by lianjia-fe
`)