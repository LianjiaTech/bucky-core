export default {
  defaultAction: {
    // csrf 作用是判断来访者身份，如果是 false 不会判断
    // 默认操作是，如果是 post, put, delete 操作，并且 来访者 域名的根域名和
    // 当前页面域名的根域名不用，则会拒绝，如果是 ip 访问，如果不同 ip 则会拒绝
    // 如果 csrf 为字符串 或者 字符串数组，则相当于设置白名单，白名单中的域名会被任何
    // 白名单中请填写根域名 或者 ip
    // csrf: false,
    // csrf: ['other-domain.com'],

    // 如果 beforeHandler return false 则不会触发 handler
    // 记得在 beforeHandler 中 不要出现停滞的状态 真不行就抛异常
    async beforeHandler (ctx) {

      // if (this.needLogin === 'maybe') {
      //   const user = ctx.request.user = ctx.user =
      //     await ctx.request.checkLogin({redirectLogin: false})
      //   return
      // }

      // if (this.needLogin) {
      //   const user = ctx.request.user = ctx.user =
      //     await ctx.request.checkLogin()
      //   if (!user) return false
      // }
      // 可做登录等校验，作为是否调用action的前置条件
    },

    // 在此处处理 所有业务逻辑
    async handler (ctx) {
      ctx.response.notFound('还没有定义action')
    }
  }
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {}
// 测试环境配置
export const testing = {}