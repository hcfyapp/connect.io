import Port from './port';

const {runtime} = chrome;

export default class Client extends Port {

  /**
   * 客户端
   * @param {String} [eId]
   */
  constructor( eId ) {
    super( runtime.connect( eId || runtime.id ) );
  }
};
