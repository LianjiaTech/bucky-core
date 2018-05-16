// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const fs = require('fs')
const os = require('os')
const path = require('path')

// == third-party ==
const Busboy = require('busboy')

// == utils ==
const { uuid } = require('../utils')

const defaultFormType = [
  'multipart/form-data',
  'application/octet-stream'
]

function extractFormData (string) {
  const arr = string.split('[')
  const first = arr.shift()
  const res = arr.map( v => v.split(']')[0] )
  res.unshift(first)
  return res
}

function reconcile (obj, target) {
  const key = Object.keys(obj)[0]
  const val = obj[key]

  if (target.hasOwnProperty(key)) {
    return reconcile(val, target[key])
  } else {
    return target[key] = val
  }
}

function objectFromBluePrint (arr, value) {
  return arr
    .reverse()
    .reduce((acc, next) => {
      if (Number(next).toString() === 'NaN') {
        return {[next]: acc}
      } else {
        const newAcc = []
        newAcc[ Number(next) ] = acc
        return newAcc
      }
    }, value)
};


function onField (fields, name, val, fieldnameTruncated, valTruncated) {
  if (name.indexOf('[') > -1) {
    const obj = objectFromBluePrint(extractFormData(name), val)
    reconcile(obj, fields)
  } else {
    fields[name] = val
  }
}

function onFile (filePromises, tmpdir, fieldname, file, filename,
  encoding, mimetype) {

  const tmpName = file.tmpName = [ Date.now(), uuid() ].join('_')
  const saveTo = path.join(tmpdir, path.basename(tmpName))
  const writeStream = fs.createWriteStream(saveTo)

  const makeReadStream = () => {
    const readStream = fs.createReadStream(saveTo)
    readStream.fieldname = fieldname
    readStream.filename = filename
    readStream.transferEncoding = readStream.encoding = encoding
    readStream.mimeType = readStream.mime = mimetype
    readStream.clone = makeReadStream
    return readStream
  }

  const filePromise = new Promise((resolve, reject) => {
    writeStream
      .on('error', reject)
      .on('open', () => {
        file
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', () => resolve( makeReadStream() ))
      })
  })

  filePromises.push(filePromise)
}

function getFormData (req, config = {}) {

  const busboy = new Busboy({ headers: req.headers })
  const { fileTempDir } = config

  return new Promise((resolve, reject) => {

    const fields = {}
    const filePromises = []

    busboy
      .on('field', onField.bind(null, fields))
      .on('file', onFile.bind(null, filePromises, fileTempDir))
      .on('close', cleanup)
      .on('error', onError)
      .on('end', onEnd)
      .on('finish', onEnd)

    busboy.on('partsLimit', function(){
      const err = new Error('Reach parts limit')
      err.code = 'Request_parts_limit'
      err.status = 413
      onError(err)
    })

    busboy.on('filesLimit', () => {
      const err = new Error('Reach files limit')
      err.code = 'Request_files_limit'
      err.status = 413
      onError(err)
    });

    busboy.on('fieldsLimit', () => {
      const err = new Error('Reach fields limit')
      err.code = 'Request_fields_limit'
      err.status = 413
      onError(err)
    });

    req.pipe(busboy)

    function onError (err) {
      cleanup()
      reject(err)
    }

    function onEnd (err) {
      if(err) return reject(err)
      Promise.all(filePromises)
        .then((files) => {
          cleanup()
          resolve({fields, files})
        })
        .catch(reject)
    }

    function cleanup () {
      busboy.removeListener('field', onField)
      busboy.removeListener('file', onFile)
      busboy.removeListener('close', cleanup)
      busboy.removeListener('end', cleanup)
      busboy.removeListener('error', onEnd)
      busboy.removeListener('partsLimit', onEnd)
      busboy.removeListener('filesLimit', onEnd)
      busboy.removeListener('fieldsLimit', onEnd)
      busboy.removeListener('finish', onEnd)
    }
  })
}

module.exports = config => {

  config = Object.assign({
    // 默认文件缓存的位置
    fileTempDir: os.tmpdir()
  }, config)

  return (ctx, next) => {

    ctx.form = {}

    if (defaultFormType.indexOf(ctx.request.type) <= -1) return next()

    // 获取 from 表单内容
    // getFormData 会产生 files 的零食文件
    let formFiles = []
    return getFormData(ctx.req, config).then(({
      fields,    // from 表单文字内容
      files      // from 表单文件内容
    }) => {
      // 是否是单文件
      const isOneFile =
        files.length === 1 && !files[0].fieldname && !Object.keys(fields).length

      let formData = {}
      if ( isOneFile ) {
        formData = files[0]
      } else {
        Object.assign(formData, fields)
        files.forEach(file => formData[file.fieldname] = file)
      }

      ctx.form = ctx.request.form = formData
      formFiles = files
      return next()

    }).then(() => {
      // 删除临时文件
      formFiles.forEach( file => fs.unlink(file.path) )
      formFiles.length = 0
    })
  }
}