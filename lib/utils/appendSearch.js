// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * 往 uri 上追加 search
 * @param  {Object}  object
 * @param  {Boolean} encode
 * @return {String}
 */
module.exports = function appendSearch (uri='', search='') {

  const uriLast = uri[uri.length - 1]
  if (uriLast === '?' || uriLast === '&') uri = uri.substring(uri.length - 1)

  const searchFirst = search[0]
  if (searchFirst === '?' || searchFirst === '&') search = search.substring(1)

  if (search.length === 0) return uri

  const spliter = uri.indexOf('?') === -1 ? '?' : '&'

  return uri + spliter + search
}