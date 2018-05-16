import url from 'url'

// 404 页面通用返回
// ctx.response.notFound('和这个页面不存在')

export default (ctx, config) => (message) => {

  const referrer = ctx.request.get('referrer') || ''
  if (
    url.parse(referrer).host === ctx.request.host &&
    ctx.request.headers['x-requested-with'] === 'XMLHttpRequest'
  ) {
    ctx.response.ajax(null, {error: 'NOT_FOUND', message})
    return
  }
  ctx.response.status = 200
  ctx.response.render('404', { message })
}