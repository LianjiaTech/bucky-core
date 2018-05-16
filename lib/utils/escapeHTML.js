// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * html 特殊字符转译
 * @param  {String} text
 * @return {String}
 */
module.exports = function escapeHTML (text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}