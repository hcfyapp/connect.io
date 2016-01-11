import Port from './port';
import runtime from './runtime';

const id = runtime && runtime.id;

export default runtime ? class extends Port {

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

    // 把参数放在 name 里传到服务端
    const name = JSON.stringify( {
      _namespace : np
    } );

    let port;

    switch ( typeof eIdOrTabId ) {
      case 'string':
        port = runtime.connect( eIdOrTabId , {
          name
        } );
        break;

      case 'number':
        port = chrome.tabs.connect( eIdOrTabId , {
          frameId : options.frameId ,
          name
        } );
        break;

      default:
        throw new Error( 'chrome.runtime.id is undefined, you may in the normal web page, please specify the extension id which you want to connect.' );
    }

    super( port );
    this.namespace = np;
  }
} : function () { throw new Error( 'You\'re not in Google Chrome.' ); };
