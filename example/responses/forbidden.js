import url from 'url'

// 403 页面通用返回
// ctx.response.forbidden('和这个页面没有权限访问')

export default (ctx, config) => (message) => {

  const referrer = ctx.request.get('referrer') || ''
  if (
    url.parse(referrer).host === ctx.request.host &&
    ctx.request.headers['x-requested-with'] === 'XMLHttpRequest'
  ) {
    ctx.response.ajax(null, {error: 'FORBIDDEN', message})
    return
  }
  ctx.response.status = 200
  ctx.response.render('403', { message })
}