export default [

  // rewrite 规则
  // 动态改变 url 让其走到对应的路由
  // 是 app 内部逻辑
  // 规则从上到下，如果匹配则不会再往下走了

  // from 可以是 正则，方法，字符串
  // 当url 被 正则匹配 或 方法返回非空 或 字符串匹配 minimatch
  // 则会走到对应的 to
  // to 可以是字符串，也可以是方法
  // 如果是方法 参数接收 正则匹配的match值， 方法返回值， 字符串是否匹配的布尔值
  // 返回为 字符串

  // 这个例子是改写 页面图标 的路由
  { from: '/favicon.ico', to: '/public/favicon.ico', break: true },
  { from: /^\/github\/search\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/?$/, to: '/github/search?language=$1&word=$2', break: true }
]