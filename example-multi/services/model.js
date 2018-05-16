export default (config, app, io) => {
  return (ctx, next) => {
    const projectName = ctx.request.url.split('/')[1]
    if (projectName) {
      ctx.Model = new Proxy({}, { get (object, key) {
        try {
          return Model[projectName + '/' + key]
        } catch (error) { return }
      }})
    }
    return next()
  }
}