import url from 'url'

// 系统 302 条转页面
// ctx.response.redirect('http://google.com'

// 通过页面 js 脚本跳转的话
// ctx.response.redirect('http://google.com', {viaJavascript: true})

export default (ctx, config) => (target, options) => {

  const {
    viaJavascript = false
  } = options || {}

  const referrer = ctx.request.get('referrer') || ''
  if (
    url.parse(referrer).host === ctx.request.host &&
    ctx.request.headers['x-requested-with'] === 'XMLHttpRequest'
  ) {
    ctx.response.ajax(target, {
      error: 'REDIRECT',
      message: 'page will redirect.'
    })
    return
  }

  if (viaJavascript) {
    ctx.response.status = 200
  } else {
    ctx.response.status = 302
    ctx.response.set('Location', target)
  }
  ctx.response.render('302', { url: target, viaJavascript })
}