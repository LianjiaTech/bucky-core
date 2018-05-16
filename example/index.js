`
   __                __
  |  |--.--.--.----.|  |--.--.--.
  |  _  |  |  |  __||    <|  |  |
  |_____|_____|____||__|__|___  |
                          |_____|
  with ♥︎ by lianjia-fe
`

require('babel-polyfill')
require('babel-core/register')({
  presets: ["es2015", "stage-0"],
  only: /example/
})

var appPath = require('path').resolve(__dirname)
var app = require('../lib')({appPath: appPath})

app.lift()