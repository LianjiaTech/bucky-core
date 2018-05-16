// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == third-party ==
const request = require('request')

// == utils ==
const promisify = require('./promisify')

// request promise 化
module.exports = promisify(request)
