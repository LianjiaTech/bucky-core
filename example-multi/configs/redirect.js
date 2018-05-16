export default [

  // redirect 规则
  // 命中则 302 条转到目标
  // 规则从上到下，如果匹配则不会再往下走了

  // from 可以是 正则，方法，字符串
  // 当url 被 正则匹配 或 方法返回非空 或 字符串匹配 minimatch
  // 则会走到对应的 to
  // to 可以是字符串，也可以是方法
  // 如果是方法 参数接收 正则匹配的match值， 方法返回值， 字符串是否匹配的布尔值
  // 返回为 字符串

  { from: '/redirect_to_index', to: '/' },
  { from: /^\/google\/([a-zA-Z0-9]+)\/?$/, to: 'https://google.com?q=$1' },
  { from: /^\/u\/(\d+)\/?$/, to: '/?uid=$1' },
]