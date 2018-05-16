export default {

  async handler (ctx) {
    // 渲染页面吧, about 是对应 view 文件夹下的文件
    ctx.response.render('about', { })
  }
}