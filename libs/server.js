import EventEmitter from 'events';

const {runtime} = chrome;

function noop() {}

class Connection {

  /**
   * 连接构造函数
   * @param {chrome.runtime.Port} port
   * @param {Server} server - 此连接所属的 server
   */
  constructor( port , server ) {
    const {connections} = server;
    connections.push( this );

    this.chromePort = port;
    this.server = server;

    const eventEmitter = this.eventEmitter = new EventEmitter();
    port.onMessage.addListener( ( {name, data, id} )=> {
      eventEmitter.emit( name , data , id );
    } );
    port.onDisconnect.addListener( ()=> {
      connections.splice( connections.indexOf( this ) , 1 );
      eventEmitter.emit( 'disconnect' , this );
    } );
  }

  /**
   * 发送消息到客户端
   * @param {String} msgName - 消息名称
   * @param {*} msgData - 任意消息
   * @param {Number} [msgId] - 消息 id
   */
  emit( msgName , msgData , msgId ) {
    this.chromePort.postMessage( {
      name : msgName ,
      data : msgData ,
      id : msgId
    } );
  }

  /**
   * 发送消息到当前 server 的所有客户端，除了连接本身
   * @param {String} name - 消息名称
   * @param {*} data - 任意消息
   */
  broadcast( name , data ) {
    this.server.connections.forEach( c => {
      if ( c !== this ) {
        c.emit( name , data );
      }
    } );
  }

  /**
   * 监听从客户端发送过来的消息
   * @param {String} eventName
   * @param {Function} cb
   */
  on( eventName , cb ) {
    this.eventEmitter.on( eventName , ( data , id )=> {
      let sent , sendResponse;
      if ( id ) {
        sendResponse = res => {
          if ( sent ) {
            console.warn( `Event "${eventName}" was already response.` );
            return;
          }
          sent = true;
          this.emit( `Response for "${eventName}"` , res , id );
        };
      } else {
        sendResponse = noop;
      }
      cb( data , sendResponse );
    } );
  }
}

let server;
class Server {
  constructor() {
    if ( server ) { // 单例模式
      return server;
    }
    server = this;
    const eventEmitter = this.eventEmitter = new EventEmitter();

    /**
     * 连接的集合
     * @type {Connection[]}
     */
    this.connections = [];

    runtime.onConnectExternal.addListener( onPortConnect.bind( this ) );
    runtime.onConnect.addListener( onPortConnect.bind( this ) );

    function onPortConnect( chromePort ) {
      eventEmitter.emit( 'connect' , new Connection( chromePort , this ) );
    }
  }

  /**
   * 将消息发送给所有客户端
   * @param {String} name
   * @param {*} [data]
   */
  emit( name , data ) {
    this.connections.forEach( c => c.emit( name , data ) );
  }

  /**
   * 监听事件
   * @param {String} eventName
   * @param {Function} cb
   */
  on( eventName , cb ) {
    this.eventEmitter.on( eventName , cb );
  }
}

export default Server;
