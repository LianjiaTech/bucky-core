// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
const slash = '/'
/**
 * formatPath 格式化 url 路径
 * @param  {String}
 * @return {String}
 *
 * /fsdfsd/fdsfdsf//fds///dfsds/ => /fsdfsd/fdsfdsf/fds/dfsds
 *
 */
module.exports = function formatPath (path) {
  return '/' + path.split(slash).filter(item => !!item.length).join(slash)
}