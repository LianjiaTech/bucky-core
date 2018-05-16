// ajax 通用返回方法
// ctx.response.ajax(data)
// ctx.response.ajax(data, {error: true, message: '加载失败'})
// 成功， 失败的返回值在 config/response.js 中定义

export default (ctx, config) => (data, errorReason) => {

  let {error, message} = errorReason || {}
  let code = config.code.SUCCESS

  const handlerKey = config.jsonpHandlerKey || 'jsonp'
  const handler = ctx.request.query[handlerKey]

  if (error) {
    code = config.code[error] || config.code.ERROR
  }
  const json = JSON.stringify({ code, data, msg: message })

  ctx.response.status = 200
  ctx.body = `try { ${handler}(${json}) } catch(e) {}`
}