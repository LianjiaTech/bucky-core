export default {

  async handler (ctx) {
    ctx.response.jsonp({ greeting: 'hello jsonp' })
  }
}