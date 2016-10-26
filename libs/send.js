var createClient = require('./client')

module.exports = send

/**
 * 发送一次性消息
 * @param options
 * @param {String} [options.id] - 如果是字符串，则视为应用或扩展的 id；如果是数字，则视为标签页的 id
 * @param {Number} [options.frameId] - 如果是要连接到标签页，可以指定要连接到其中的哪个 frame，否则会连接至所有 frame
 *
 * @param {String} [options.namespace] - 此客户端所属的服务端命名空间
 *
 * @param {String} options.name - 消息名称
 * @param {*} [options.data] - 消息数据
 * @param {Boolean} [options.needResponse] - 是否需要响应。如果是，则方法会返回一个 Promise
 *
 * @return {Promise|undefined}
 */
function send (options) {
  var client = createClient(options.id, { frameId: options.frameId, namespace: options.namespace })
  var promise = client.send(options.name, options.data, options.needResponse)
  if (promise) {
    return promise.then(
      function (response) {
        client.disconnect()
        return response
      },
      function (error) {
        client.disconnect()
        return Promise.reject(error)
      }
    )
  } else {
    client.disconnect()
  }
}
