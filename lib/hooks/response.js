// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const path = require('path')

// == utils ==
const { walkFile, escapeHTML } = require('../utils')

function renderJSON (json) {
  this.type = 'json'
  this.body = JSON.stringify(json)
}

function notFound () {
  this.status = 404
  this.type = 'html'
  this.body = 'Not Found'
}

function forbidden () {
  this.status = 403
  this.type = 'html'
  this.body = 'Forbidden'
}

function redirect (url, options) {
  const { viaJavascript = false } = options || {}

  this.type = 'html'
  if (viaJavascript) {
    this.status = 200
    this.body = 'Moved Temporarily'
  } else {
    this.status = 302
    this.set('Location', url)
    this.body = ''+
      'Moved Temporarily <script>location.replace(' +
        escapeHTML(JSON.stringify(url)) +
      ')</script>'
  }
}

function serverError (error) {

  try {
    this.status = 500
    this.type = 'html'
  } catch (e) {}

  this.body = 'Server Error'
  if (error) {
    this.body += '' +
      '<pre>' + escapeHTML(error.toString()) + '</pre>' +
      '<pre>' + escapeHTML(error.stack) +      '</pre>'
  }
}


module.exports = (app, { appPath }) => {

  const responseDirPath = path.join(appPath, 'responses')
  const viewDirPath = path.join(appPath, 'views')

  app.use( (ctx, next) => {
    ctx.notFound = ctx.response.notFound = notFound.bind(ctx.response)
    ctx.forbidden = ctx.response.forbidden = forbidden.bind(ctx.response)
    ctx.redirect = ctx.response.redirect = redirect.bind(ctx.response)
    ctx.serverError = ctx.response.serverError = serverError.bind(ctx.response)

    ctx.json = ctx.response.json = renderJSON.bind(ctx.response)

    return next()
  })
  // 自定义的response
  walkFile(responseDirPath, filePath => {
    const { name } = path.parse(filePath)
    const response = require(filePath).default

    app.use( (ctx, next) => {
      const _response = response(ctx, app.config.response)
      ctx[name] = ctx.response[name] = (...arg) => {
        try { return _response.apply(null, arg) } catch (error) {
          return serverError.call(ctx.response, error)
        }
      }
      return next()
    })
  })

}