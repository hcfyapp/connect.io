import Port from './port';

export default class Client extends Port {

  /**
   * 客户端
   * @param {String} [eId]
   */
  constructor( eId ) {
    super( chrome.runtime.connect( eId ) );
  }
};
