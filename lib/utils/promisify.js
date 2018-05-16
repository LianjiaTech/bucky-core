// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
/**
 * 将 node callback 方式转化成 promise 的方式
 * @param  {Function}   originalFunction
 * @param  {any}        context
 * @param  {Boolean}    returnMulitArgs
 * @return {Promise}
 */
module.exports = function promisify (originalFunction, context, returnMulitArgs=false) {
  return (...args) => {
    return new Promise( (resolve, reject) => {

      const callback = (error, ...values) => {
        error ? reject(error) :
          returnMulitArgs ? resolve(values) : resolve(values[0])
      }

      originalFunction.apply(context, args.concat(callback))
    })
  }
}