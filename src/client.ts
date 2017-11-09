import Port from './port'
import runtime from './utils/chrome-runtime'

export interface IOptions {
  /** 此客户端所在的命名空间的名称。默认为 'default' */
  namespace?: string
  /** 如果第一个参数是 tabId，则此参数指定要连接到指定标签页的某个 frame。默认会连接到指定标签页的所有 frame。 */
  frameId?: number
}

export type TExtentionIdOrTabId = string | number

const { id } = runtime

/**
 * 客户端
 * @param eIdOrTabId - 扩展 id 或标签页 id。默认值为 chrome.runtime.id
 * @param options - 设置
 * @see https://developer.chrome.com/extensions/runtime#method-connect
 * @see https://developer.chrome.com/extensions/tabs#method-connect
 */
export default function(
  eIdOrTabId?: TExtentionIdOrTabId | IOptions,
  options?: IOptions
) {
  // createClient(options)
  if (typeof eIdOrTabId === 'object') {
    options = eIdOrTabId as IOptions
    eIdOrTabId = undefined
  }

  // createClient(eIdOrTabId, options)
  if (!options) {
    options = {}
  }

  if (eIdOrTabId == null) eIdOrTabId = id

  const portNamespace = options.namespace || 'default'

  // 把参数放在 name 里传到远程端口
  const params = JSON.stringify({
    _namespace: portNamespace
  })

  let chromePort: chrome.runtime.Port

  if (typeof eIdOrTabId === 'string') {
    chromePort = runtime.connect(eIdOrTabId, { name: params })
  } else if (typeof eIdOrTabId === 'number') {
    chromePort = chrome.tabs.connect(eIdOrTabId, {
      frameId: options.frameId,
      name: params
    })
  } else {
    throw new Error(
      'chrome.runtime.id is undefined, please specify the extension id which you want to connect.'
    )
  }

  return new Port(chromePort)
}
