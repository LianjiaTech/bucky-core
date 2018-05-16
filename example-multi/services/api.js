export default (config, app, io) => {
  return (ctx, next) => {
    const projectName = ctx.request.url.split('/')[1]
    if (projectName) {
      ctx.API = new Proxy({}, { get (object, key) {
        try {
          const group = API[projectName + '/' + key]
          if (!group) return
          return new Proxy({}, { get (object, key) {
            try {
              const api = group[key]
              if (!api) return
              return (data, options) => api(data, Object.assign({ctx}, options))
            } catch (e) { return }
          }})
        } catch (e) { return }
      }})
    }
    return next()
  }
}