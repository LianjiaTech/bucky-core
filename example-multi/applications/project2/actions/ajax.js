export default {
  
  cors: {
    origin: 'http://0.0.0.0:6003',
    headers: 'X-Requested-With, Content-Type',
    credentials: 'true'
  },

  async handler (ctx) {
    ctx.response.ajax({ greeting: 'hello ajax' })
  }
}