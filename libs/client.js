import Port from './port';

const {runtime} = chrome;
const {id} = runtime;

export default class Client extends Port {

  /**
   * 客户端
   * @param {String|Number} [eIdOrTabId] - 扩展 id 或标签页 id。默认值为 chrome.runtime.id
   * @param {Object} [options] - 设置
   * @param {Number} [options.frameId] - 如果第一个参数是 tabId，则此参数指定要连接到指定标签页的某个 frame。默认会连接到指定标签页的所有 frame。
   * @param {String} [options.namespace] - 此客户端所在的命名空间的名称。默认为 default
   * @see https://developer.chrome.com/extensions/runtime#method-connect
   * @see https://developer.chrome.com/extensions/tabs#method-connect
   */
  constructor( eIdOrTabId = id , options ) {

    // new Client(options)
    if ( typeof eIdOrTabId === 'object' ) {
      options = eIdOrTabId;
      eIdOrTabId = id;
    }
    // new Client(eIdOrTabId,options) is default.

    if ( !options ) {
      options = {};
    }

    const np = options.namespace || 'default';

    let port;

    switch ( typeof eIdOrTabId ) {
      case 'string':
        port = runtime.connect( eIdOrTabId , {
          name : JSON.stringify( {
            _namespace : options.namespace
          } )
        } );
        break;

      case 'number':
        port = chrome.tabs.connect( eIdOrTabId , {
          frameId : options.frameId ,
          name : JSON.stringify( {
            namespace : np
          } )
        } );
        break;

      default:
        throw new Error( 'chrome.runtime.id is undefined, please specify the tabId.' );
    }

    super( port );
    this.namespace = np;
  }
};
