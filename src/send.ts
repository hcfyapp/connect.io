import createClient, { TExtentionIdOrTabId, IOptions } from './client'

interface ISendOptions {
  id?: TExtentionIdOrTabId
  frameId: IOptions['frameId']
  namespace: IOptions['namespace']
  name: string
  data: any
  needResponse?: boolean
}

/** 发送一次性消息 */
export default function(options: ISendOptions) {
  const client = createClient(options.id, {
    frameId: options.frameId,
    namespace: options.namespace
  })
  const promise = client.send(options.name, options.data, options.needResponse)
  if (promise) {
    return promise.then(
      response => {
        client.disconnect()
        return response
      },
      error => {
        client.disconnect()
        return Promise.reject(error)
      }
    )
  } else {
    client.disconnect()
  }
}
