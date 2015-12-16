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

    runtime.onConnectExternal.addListener( onPortConnect.bind( this ) );
    runtime.onConnect.addListener( onPortConnect.bind( this ) );

    function onPortConnect( chromePort ) {
      const port = new Port( chromePort );
      port.on( 'disconnect' , ()=> {
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
      this.emit( 'connect' , port );
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
