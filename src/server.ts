import TinyEmitter from 'tinyemitter'
import noop from './utils/noop'
import Port from './port'

// 第一次调用 new Server() 的时候才添加这些事件监听
let initListener = function() {
  initListener = noop

  const { onConnect, onConnectExternal } = chrome.runtime

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

export interface EventHandlers {
  connect: (client: ServerPort) => void
}

export class Server extends TinyEmitter {
  private namespace: string
  readonly ports: ServerPort[]

  constructor(namespace: string) {
    super()
    initListener()
    this.namespace = namespace

    /** 连接到此服务端的端口的集合 */
    this.ports = []
  }

  // 为了添加更准确的类型注释需要覆盖一下 on 方法
  on<T extends keyof EventHandlers>(name: T, handle: EventHandlers[T]) {
    super.on(name, handle)
  }

  /**
   * 发送消息到此服务器下的所有客户端
   * @param name
   * @param data
   */
  send(name: string, data: any) {
    this.ports.forEach(clientPort => {
      clientPort.send(name, data)
    })
  }
}

export class ServerPort extends Port {
  /** 这个端口所属的服务端 */
  server: Server
  /** 这个端口是否是外部端口 */
  external: boolean

  constructor(
    server: Server,
    chromePort: chrome.runtime.Port,
    external: boolean
  ) {
    super(chromePort)
    this.server = server
    this.external = external

    const { ports } = server
    ports.push(this)
    const disconnectHandle = () => {
      ports.splice(ports.indexOf(this), 1)
    }
    this.on('disconnect', disconnectHandle)
  }

  /** 广播消息的方法。消息将会发送到此端口所属服务器下的所有端口，除了发起这个广播的端口本身。 */
  broadcast(name: string, data: any) {
    this.server.ports.forEach(clientPort => {
      if (clientPort !== this) {
        clientPort.send(name, data)
      }
    })
  }
}

/** namespace 到 server 对象的映射表 */
interface IServersMap {
  [namespace: string]: Server
}

const serversMap: IServersMap = {}

export default function(namespace = 'default') {
  const existServer = serversMap[namespace]
  if (existServer) return existServer
  return (serversMap[namespace] = new Server(namespace))
}

/**
 * 初始化服务端的端口
 * @param chromePort
 * @param isExternal - 此连接是否为外部连接
 */
function initServerPort(chromePort: chrome.runtime.Port, isExternal: boolean) {
  let options

  // 由 createClient 发送过来的 chromePort 一定有 name，且 name 可转换为 JSON 并有 _namespace 属性。
  // 若没有则说明这个客户端不是 client 发来的，此时直接忽略
  try {
    options = JSON.parse(chromePort.name)
  } catch (e) {
    return
  }

  const { _namespace } = options
  if (!_namespace) return

  // 如果此 client 尝试连接的 namespace 在服务端没有，则断开连接
  const server = serversMap[_namespace]
  if (!server) {
    chromePort.disconnect()
    return
  }

  server.emit('connect', new ServerPort(server, chromePort, isExternal))
}
