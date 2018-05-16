export default class Github {

  // 静态方法，搜索 github 中的项目
  static async searchRepositories ({word, language}) {

    const sort = 'stars'
    const order = 'desc'

    const q = word + (language && `+language:${language}`)

    return await API.github.searchRepositories({ q, sort, order }, {
      uriReplacer: {search: 'search'}
    })
  }
}