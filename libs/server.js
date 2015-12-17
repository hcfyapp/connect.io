import EventEmitter from 'events';
import Port from './port';

const {runtime} = chrome;

let server;
export default class Server extends EventEmitter {
  constructor() {
    if ( server ) {
      return server;
    }
    super();
    server = this;

    /**
     * 端口的集合
     * @type {Port[]}
     */
    const ports = this.ports = [];

    runtime.onConnect.addListener( chromePort => {
      initServerPort( chromePort , false );
    } );

    let {onConnectExternal} = runtime;
    if ( onConnectExternal ) {
      onConnectExternal.addListener( chromePort => {
        initServerPort( chromePort , true );
      } );
    }

    /**
     * 初始化服务端的端口
     * @param {chrome.runtime.Port} chromePort
     * @param {Boolean} isExternal - 此连接是否为外部连接
     */
    function initServerPort( chromePort , isExternal ) {
      const port = new Port( chromePort );
      port.exteranl = isExternal;
      port.once( 'disconnect' , ()=> {
        ports.splice( ports.indexOf( port ) , 1 );
      } );

      /**
       * 广播消息的方法。消息将会发送到服务器的所有客户端，除了发起这个广播的客户端本身。
       * @param {String} name
       * @param {*} [data]
       */
      port.broadcast = ( name , data )=> {
        ports.forEach( clientPort => {
          if ( clientPort !== port ) {
            clientPort.send( name , data );
          }
        } );
      };
      ports.push( port );
      server.emit( 'connect' , port );
    }
  }

  /**
   * 发送消息到此服务器下的所有客户端
   * @param {String} name
   * @param {*} [data]
   */
  send( name , data ) {
    this.ports.forEach( clientPort => {
      clientPort.send( name , data );
    } );
  }
};
