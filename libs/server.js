import EventEmitter from 'events'
import Port from './port'
import noop from './noop'
import runtime from './runtime'

/**
 * 一个 map，key 为 server 的 namespace，值为 server
 * @type {{}}
 */
const serversMap = {}

// 第一次调用 new Server() 的时候才添加这些监听
let initListener

if (runtime) {
  initListener = () => {
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
} else {
  initListener = noop
}

/**
 * 初始化服务端的端口
 * @param {chrome.runtime.Port} chromePort
 * @param {Boolean} isExternal - 此连接是否为外部连接
 */
function initServerPort (chromePort, isExternal) {
  // 由 Client 发送过来的客户端一定带有 name，且 name 可转换为 JSON 并有 _namespace 属性
  let options

  try {
    options = JSON.parse(chromePort.name)
  }
  catch (e) {
    return
  }

  const { _namespace } = options
  if (!_namespace) {
    return
  }

  const server = serversMap[_namespace]
  if (!server) {
    chromePort.disconnect()
    return
  }
  const { ports } = server
  const port = new Port(chromePort)

  port.external = isExternal
  port.once('disconnect', () => {
    ports.splice(ports.indexOf(port), 1)
  })

  /**
   * 广播消息的方法。消息将会发送到服务器的所有客户端，除了发起这个广播的客户端本身。
   * @param {String} name
   * @param {*} [data]
   */
  port.broadcast = (name, data) => {
    ports.forEach(clientPort => {
      if (clientPort !== port) {
        clientPort.send(name, data)
      }
    })
  }
  ports.push(port)
  server.emit('connect', port)
}

export default runtime ? class extends EventEmitter {
  constructor (namespace = 'default') {
    initListener()
    super() // super() 必须被第一个执行，否则会出错

    const already = serversMap[namespace]
    if (already) {
      return already
    }
    serversMap[namespace] = this

    this.namespace = namespace

    /**
     * 端口的集合
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
} : function () { throw new Error('You\'re not in Google Chrome.') }
