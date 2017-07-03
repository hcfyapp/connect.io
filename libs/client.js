import Port from './port'
import runtime from './utils/chrome-runtime'

const { id } = runtime

/**
 * 客户端
 * @param {String|Number} [eIdOrTabId] - 扩展 id 或标签页 id。默认值为 chrome.runtime.id
 * @param {Object} [options] - 设置
 * @param {Number} [options.frameId] - 如果第一个参数是 tabId，则此参数指定要连接到指定标签页的某个 frame。默认会连接到指定标签页的所有 frame。
 * @param {String} [options.namespace] - 此客户端所在的命名空间的名称。默认为 'default'
 * @see https://developer.chrome.com/extensions/runtime#method-connect
 * @see https://developer.chrome.com/extensions/tabs#method-connect
 */
export default function (eIdOrTabId, options) {
  // createClient(options)
  if (typeof eIdOrTabId === 'object') {
    options = eIdOrTabId
    eIdOrTabId = id // 默认连接到扩展程序本身
  }

  // createClient(eIdOrTabId, options)
  if (!options) {
    options = {}
  }
  if (eIdOrTabId == null) eIdOrTabId = id

  const portNamespace = options.namespace || 'default'

  // 把参数放在 name 里传到服务端
  const params = JSON.stringify({
    _namespace: portNamespace
  })

  let chromePort
  switch (typeof eIdOrTabId) {
    case 'string': // 扩展 id 是字符串
      chromePort = runtime.connect(eIdOrTabId, { name: params })
      break

    case 'number': // 标签页 id 是数字
      chromePort = chrome.tabs.connect(eIdOrTabId, {
        frameId: options.frameId,
        name: params
      })
      break

    default:
      throw new Error('chrome.runtime.id is undefined, please specify the extension id which you want to connect.')
  }

  const port = new Port(chromePort)
  port.namespace = portNamespace
  return port
}
