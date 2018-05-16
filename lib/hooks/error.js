// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// 这边的 APIError ApplicationError 请不要用了，在bucky的代码中
// 直接 new Error 就可以了
// 这几个就是逗逼，但是有一些应用里面已经用了，所以我还不敢删

class APIError {
  constructor ({
    type='', url='', message=''
  }) {
    Error.captureStackTrace(this, APIError)
    Object.assign(this, {name: 'APIError', type, message, url })
  }
  toString () {
    return [
      `APIError: ${this.type}`,
      `url: ${this.url}`,
      `message: ${this.message}`
    ].join('\n')
  }
}

class ApplicationError {
  constructor ({
    type='', message=''
  }) {
    Error.captureStackTrace(this, ApplicationError)
    Object.assign(this, {name: 'ApplicationError', type, message})
  }
  toString () {
    return [
      `ApplicationError: ${type}`,
      `message: ${message}`
    ].join('\n')
  }
}

module.exports = app => {
  global.Error = global.Error || {}
  Object.assign(global.Error, { APIError, ApplicationError })
}