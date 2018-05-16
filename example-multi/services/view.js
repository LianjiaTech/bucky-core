import path from 'path'

export default (config, app, io) => {
  return (ctx, next) => {

    const { render, renderToString } = ctx
    const projectName = ctx.request.url.split('/')[1]

    function proxy(view, data, config = {}) {
      return this(
        path.join(projectName, view),
        Object.assign({
          projectName: projectName,
          static (relativePath) {
            return path.join('/', projectName, 'public', relativePath)
          }
        }, data),
        Object.assign({}, config, {
          layout: path.join(projectName, config.layout || 'layout')
        })
      )
    }
    if (projectName) {
      ctx.render = ctx.response.render = proxy.bind(render)
      ctx.renderToString = ctx.response.renderToString = proxy.bind(renderToString)
    }
    return next()
  }
}