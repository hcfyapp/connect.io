import TinyEmitter from 'tiny-emitter'
import noop from './utils/noop'
import Port from './port'
import runtime from './utils/chrome-runtime'

// 第一次调用 new Server() 的时候才添加这些事件监听
let initListener = function () {
  initListener = noop

  const { onConnect, onConnectExternal } = runtime

  if (onConnect) {
    onConnect.addListener(chromePort => {
      initServerPort(chromePort, false)
    })
  }

  if (onConnectExternal) {
    onConnectExternal.addListener(chromePort => {
      initServerPort(chromePort, true)
    })
  }
}

class Server extends TinyEmitter {
  constructor (namespace) {
    super()
    initListener()
    this.namespace = namespace

    /**
     * 连接到此服务端的端口的集合
     * @type {Port[]}
     */
    this.ports = []
  }

  /**
   * 发送消息到此服务器下的所有客户端
   * @param {String} name
   * @param {*} [data]
   */
  send (name, data) {
    this.ports.forEach(clientPort => {
      clientPort.send(name, data)
    })
  }
}

// namespace 到 server 对象的映射表
const serversMap = {}

export default function (namespace = 'default') {
  const existServer = serversMap[namespace]
  if (existServer) return existServer
  return (serversMap[namespace] = new Server(namespace))
}

/**
 * 初始化服务端的端口
 * @param {chrome.runtime.Port} chromePort
 * @param {Boolean} isExternal - 此连接是否为外部连接
 */
function initServerPort (chromePort, isExternal) {
  // 由 Client 发送过来的客户端一定带有 name，且 name 可转换为 JSON 并有 _namespace 属性。
  // 若没有则说明这个客户端不是 client 发来的
  let options

  try {
    options = JSON.parse(chromePort.name)
  } catch (e) {
    return
  }

  const { _namespace } = options
  if (!_namespace) return

  // 如果此 client 尝试连接的服务端没有，则断开连接
  const server = serversMap[_namespace]
  if (!server) {
    chromePort.disconnect()
    return
  }

  // 将此端口加入到服务端的端口列表中
  const { ports } = server
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
    ports.forEach(clientPort => {
      if (clientPort !== port) {
        clientPort.send(name, data)
      }
    })
  }
  ports.push(port)

  server.emit('connect', port)
}
