import EventEmitter from 'events';
import uuid from 'node-uuid';

function noop() {}

export default class Port extends EventEmitter {

  /**
   * 对 chrome 的 Port 类型的包装
   * @param {chrome.runtime.Port} port
   */
  constructor( port ) {
    super();

    /**
     * 由 Client 生成一个 uuid name 并设为 Port 的 id。
     * @type {String}
     */
    this.id = port.name;

    /**
     * 一个 hash map，键是消息的 uuid，值是一个函数
     * @type {{}}
     */
    const waitingResponseMsg = this._waiting = {};
    this.port = port;

    port.onMessage.addListener( msg => {
      const {name,data,id} = msg;

      // 如果在字典里找到了对应 id 的回调函数，那么说明这个消息是由本地端口发送的并有回调函数
      // 否则说明这个消息是由远程端口发送的，要把 id 传回去，让远程端口定位到它的回调函数；此时这个消息是没有 name 的
      const cb = waitingResponseMsg[ id ];
      if ( cb ) {
        delete waitingResponseMsg[ id ];
        cb( data );
      } else {
        let sent , sendResponse;
        if ( id ) {

          /**
           * 发送处理结果至远程端口。这个函数只能被调用一次。
           * @param {*} [response]
           */
          sendResponse = response => {
            if ( sent ) {
              console.warn( `Event "${eventName}" was already response.` );
              return;
            }
            sent = true;
            // 发送回执时，此消息是没有 name 的
            port.postMessage( { id , data : response } );
          };
        } else {
          sendResponse = noop;
        }

        this.emit( name , data , sendResponse );
      }
    } );

    // 这个回调说明连接是被远程端口断开的
    port.onDisconnect.addListener( ()=> {
      this.emit( 'disconnect' , true ); // true 表明连接是被远程端口断开的
    } );

    this.on( 'disconnect' ,
      /**
       * 当连接断开时，告诉所有等待响应的消息一个错误
       * @param {Boolean} isRemote - 连接是否是被远程端口断开的
       */
      isRemote => {
        for ( let key in waitingResponseMsg ) {
          waitingResponseMsg[ key ]( undefined , `Connection has been disconnected by ${isRemote ? 'Server' : 'Client'}.` );
          delete waitingResponseMsg[ key ];
        }
      } );
  }

  /**
   * 发送消息到另一端
   * @param {String} name - 消息名称
   * @param {*} [data] - 数据
   * @param {Function} [onComplete] - 完成时的回调函数
   *
   * @example
   * send('x',{my:'data'})
   * send('x',(res)=>{})
   * send('x',{my:'data'},(res)=>{})
   */
  send( name , data , onComplete ) {
    if ( typeof data === 'function' ) {
      onComplete = data;
      data = undefined;
    }
    const msg = { name , data };

    if ( onComplete ) {
      // 给消息带上 uuid，这样就能通过这个 id 定位到本地等待响应的回调函数
      this._waiting[ msg.id = uuid.v4() ] = onComplete;
    }

    this.port.postMessage( msg );
  }

  /**
   * 断开与远程端口的连接
   */
  disconnect() {
    this.port.disconnect();
    this.emit( 'disconnect' , false );
  }
}

/**
 * 用一个类来描述 port 之间传递的消息。
 *
 * 当本地端口将数据发送至远程端口时，
 * 如果用户希望在远程端口处理完消息时得到处理结果（即在调用 send 方法时传递了一个回调函数），
 * 那么此消息就会带上一个 id，并以此 id 为键将回调函数保存在一个字典（this._wait 对象）里；
 * 远程端口收到消息后，先判断它自己的 this._wait 对象里有没有对应的回调函数，如果有，它就判断这个消息是它自己曾发送出去的一个消息的处理结果，并调用对应回调函数；
 * 如果没有，则会传递两个参数给监听此事件名（即消息名）的处理函数：第一个参数为 data，第二个参数为一个函数，这个函数会把调用它的第一个参数作为一个新消息的 data，并将原本的消息的 id 回传给本地端口，此消息没有 name。
 * 只是当 id 为 undefined 时，调用这个函数不会有任何操作产生。
 * @typedef {Object} Message
 * @property {String} name - 消息的名称
 * @property {*} data - 消息携带的数据
 * @property {String} id - 消息的 uuid
 */
