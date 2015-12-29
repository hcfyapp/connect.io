import Client from './client';

export default send;

/**
 * 发送一次性消息
 * @param options
 * @param {String} [options.eId] - 应用或扩展的 id
 *
 * @param {Number} [options.tabId] - 要连接到的标签页 id
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
function send( options ) {
  let { eId , tabId , frameId , namespace, name , data , needResponse} = options;

  const client = new Client( tabId || eId , { frameId , namespace } );

  const p = client.send( name , data , needResponse );
  if ( p ) {
    return p.then(
      response => {
        client.disconnect();
        return response;
      } ,
      error => {
        client.disconnect();
        return Promise.reject( error );
      }
    );
  } else {
    client.disconnect();
  }
}
