// Copyright(c) 2018 Lianjia, Inc.All Rights Reserved
// == native modules ==
const http = require('http')
const path = require('path')

// == third-party ==
const glob = require('glob')
const Socket = require('socket.io')

// == utils ==
const { walkFile, noop, deepMerge, formatPath } = require('../utils')

const defaultSocketConfig = {
  enable: true,
  server: {},
}

module.exports = (app,  { appPath, socketDir, getSocketPath}) => {

  const config = deepMerge.copy(defaultSocketConfig, app.config.socket)
  const { enable, server: serverConfig } = config

  if (!enable) return

  const server = http.createServer( app.callback() )
  const io = new Socket( server, serverConfig )

  io.config = serverConfig
  Object.assign(app, { io, listen: (...args) => server.listen(...args) })

  const socketDirPaths = glob.sync(path.join(appPath, socketDir, '/'))
  for (let socketDirPath of socketDirPaths) {

    const routeRootPath = getSocketPath.call(config,
      path.join('/', path.relative(appPath, socketDirPath), '/')
    )

    walkFile(socketDirPath, filePath => {

      let { dir, name } = path.parse(path.relative(socketDirPath, filePath))
      const routePath = formatPath(routeRootPath + '/' + dir + '/' + name)
      const namespace = routePath.substring(1)
      const defaultSocket = {
        namespace,
        connect: noop,
        disconnecting: noop,
        disconnect: noop,
        error: noop
      }

      let socket
      try { socket = require(filePath).default } catch (error) {
        app.initErrors.push(socket)
        return
      }

      const config = Object.assign({}, defaultSocket, socket)
      const nsp = io.of(namespace)

      nsp.on('connect', config.connect.bind(config))
      nsp.on('disconnecting', config.disconnecting.bind(config))
      nsp.on('disconnect', config.disconnect.bind(config))
      nsp.on('error', config.error.bind(config))

      io.on('error', error => process.emit('log.error', error))

    }, { deep: true })
  }
}