var TinyEmitter = require('tiny-emitter')
var noop = require('./utils/noop')
var Port = require('./port')
var runtime = require('./utils/chrome-runtime')

module.exports = createServer

// namespace 到 server 对象的映射表
var serversMap = {}

function createServer (namespace) {
  if (!namespace) namespace = 'default'
  var existServer = serversMap[namespace]
  if (existServer) return existServer
  return (serversMap[namespace] = new Server(namespace))
}

// 第一次调用 new Server() 的时候才添加这些事件监听
var initListener = function () {
  initListener = noop
  var onConnect = runtime.onConnect
  var onConnectExternal = runtime.onConnectExternal

  if (onConnect) {
    onConnect.addListener(function (chromePort) {
      initServerPort(chromePort, false)
    })
  }

  if (onConnectExternal) {
    onConnectExternal.addListener(function (chromePort) {
      initServerPort(chromePort, true)
    })
  }
}

function Server (namespace) {
  initListener()
  TinyEmitter.call(this)
  this.namespace = namespace

  /**
   * 连接到此服务端的端口的集合
   * @type {Port[]}
   */
  this.ports = []
}

var sp = Server.prototype = Object.create(TinyEmitter.prototype)

/**
 * 发送消息到此服务器下的所有客户端
 * @param {String} name
 * @param {*} [data]
 */
sp.send = function (name, data) {
  this.ports.forEach(function (clientPort) {
    clientPort.send(name, data)
  })
}

/**
 * 初始化服务端的端口
 * @param {chrome.runtime.Port} chromePort
 * @param {Boolean} isExternal - 此连接是否为外部连接
 */
function initServerPort (chromePort, isExternal) {
  // 由 Client 发送过来的客户端一定带有 name，且 name 可转换为 JSON 并有 _namespace 属性。
  // 若没有则说明这个客户端不是 client 发来的
  var options

  try {
    options = JSON.parse(chromePort.name)
  } catch (e) {
    return
  }

  var _namespace = options._namespace
  if (!_namespace) {
    return
  }

  // 如果此 client 尝试连接的服务端没有，则断开连接
  var server = serversMap[_namespace]
  if (!server) {
    chromePort.disconnect()
    return
  }

  // 将此端口加入到服务端的端口列表中
  var ports = server.ports
  const port = new Port(chromePort)

  port.external = isExternal
  port.once('disconnect', function () {
    ports.splice(ports.indexOf(port), 1)
  })
  /**
   * 广播消息的方法。消息将会发送到服务器的所有客户端，除了发起这个广播的客户端本身。
   * @param {String} name
   * @param {*} [data]
   */
  port.broadcast = function (name, data) {
    ports.forEach(function (clientPort) {
      if (clientPort !== port) {
        clientPort.send(name, data)
      }
    })
  }
  ports.push(port)

  server.emit('connect', port)
}
