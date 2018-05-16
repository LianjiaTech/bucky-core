// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native module ==
const qs = require('querystring')
const url = require('url')

// == utils ==
const { getType, match, isAppWebView } = require('../utils')

module.exports = app => {

  const rewriteConfigs = app.config.rewrite || []

  app.use( ({ request, response }, next) => {

    for (let config of rewriteConfigs) {
      // 是否命中跳转规则

      if (config.form) continue

      const matched = matchFrom(request, config.from)

      if ( !matched ) continue
      // 计算行路径

      let target = makeTo(matched, config.to)

      let { query, pathname } = url.parse(target)

      request.query = Object.assign({}, request.query, qs.parse(query)) //to的参数和from参数做合并，作为新的参数
      request.path = pathname

      if (config.break === true) break
    }

    return next()
  })

  //========================================================

  const redirectConfigs = app.config.redirect || []

  app.use( ({ request, response }, next) => {

    for (let config of redirectConfigs) {
      // 是否命中跳转规则
      if (config.form) continue

      const matched = matchFrom(request, config.from)

      if ( !matched ) continue
      // 计算行路径

      let target = makeTo(matched, config.to)

      const urlObject = url.parse(target)
      const query = qs.stringify(Object.assign(
        {}, request.query, qs.parse(urlObject.query)
      ))

      urlObject.query = query
      urlObject.search = !query ? '' : '?' + query

      target = url.format(urlObject)

      try { response.redirect(target) } catch (error) {
        response.serverError(error)
      }

      return Promise.resolve()
    }

    return next()
  })
}

function matchFrom (request, from) {
  return match(request.path, from, {
    headers: request.headers,
    host: request.host,
    hostname: request.hostname,
    search: request.search,
    querystring: request.querystring,
    query: request.query,
  })
}

function makeTo (matched, to) {
  switch ( getType(to) ) {
    case 'function':
      return to(...matched)
    case 'string':
      matched.forEach((replacer, index) => {
        to = to.replace(new RegExp('\\$' + index, 'g'), replacer)
      })
      return to
    default:
      return String(to)
  }
}