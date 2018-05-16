// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * 转换字符串到数组
 * @param  {String}   string
 * @param  {String}   spliter
 * @return {Array}
 */
module.exports = function string2Array ( string, spliter=',' ) {
  return String(string)
    .split(spliter)
    .map(item => item.trim())
    .filter(item => !!item.length)
}