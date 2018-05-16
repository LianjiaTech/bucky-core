export default {

  async handler (ctx) {
    // 获取 url 的 query 参数
    const {word, language} = ctx.request.query

    let items = []

    if (word) {
      // 调用 Github model
      const repositories = await Model.Github.searchRepositories({ word, language })
      items = repositories.items
    }
    Logger('github-search', `${language}: ${word}`)
    // 渲染页面吧, github/search 是对应 view 文件夹下的文件
    ctx.response.render('github/search', {word, language, items})
  }
}