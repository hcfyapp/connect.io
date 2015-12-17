import uuid from 'node-uuid';
import Port from './port';

const {runtime} = chrome;

export default class Client extends Port {

  /**
   * 客户端
   * @param {String|Number} [eIdOrTabId] - 扩展 id 或标签页 id。默认值为 chrome.runtime.id
   */
  constructor( eIdOrTabId = runtime.id ) {
    let port;

    switch ( typeof eIdOrTabId ) {
      case 'number':
        port = chrome.tabs.connect( eIdOrTabId , { name : uuid.v4() } );
        break;

      case 'string':
        port = runtime.connect( eIdOrTabId , { name : uuid.v4() } );
        break;

      default:
        throw new Error( 'chrome.runtime.id is undefined, please specify the tabId.' );
    }

    super( port );
  }
};
