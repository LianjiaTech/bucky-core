// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * formatDate 格式化日期格式
 *  
 * @param  {Integer}
 * @return {Integer}
 *
 */
module.exports = function formatDate(time, type) {
    let date = new Date(time)
    if ((date + '').toLowerCase() == 'invalid date') {
        date = new Date(parseInt(time, 10))
    }
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    m < 10 && (m = '0' + m)
    let d = date.getDate()
    d < 10 && (d = '0' + d)
    let h = date.getHours()
    h < 10 && (h = '0' + h)
    let mm = date.getMinutes()
    mm < 10 && (mm = '0' + mm)
    let s = date.getSeconds()
    s < 10 && (s = '0' + s)
    if (type === 1) {
        return y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s
    }
    return y + '-' + m + '-' + d
}