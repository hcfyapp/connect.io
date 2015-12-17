import EventEmitter from 'events';
import uuid from './uuid';

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

    this.disconnected = false;

    /**
     * 一个 hash map，键是消息的 uuid，值是一个函数
     * @type {{}}
     */
    const waitingResponseMsg = this._waiting = {};
    this.port = port;

    port.onMessage.addListener( msg => {
      const {id} = msg;

      // 如果在字典里找到了对应 id 的回调函数，那么说明这个消息是由本地端口发送的并有回调函数
      // 否则说明这个消息是由远程端口发送的，要把 id 传回去，让远程端口定位到它的回调函数；此时这个消息是没有 name 的
      const cb = waitingResponseMsg[ id ];
      if ( cb ) {
        delete waitingResponseMsg[ id ];
        cb( msg.error , msg.response );
      } else {
        let sent , sendResponse;
        if ( id ) {

          /**
           * 发送处理结果至远程端口。这个函数只能被调用一次。
           * @param {*} [error] - 错误
           * @param {*} [response]
           */
          sendResponse = ( error , response ) => {
            if ( sent ) {
              console.warn( `Message "${msg.name}" was already response.` );
              return;
            }
            sent = true;
            // 发送回执
            port.postMessage( { id , response , error } );
          };
        } else {
          sendResponse = noop;
        }

        this.emit( msg.name , msg.data , sendResponse );
      }
    } );

    // 进入这个回调说明连接是被远程端口断开的
    port.onDisconnect.addListener( ()=> {
      this.emit( 'disconnect' , true );
    } );

    // 实际上，每个 port 的 disconnect 事件只会触发一次，所以我也只监听一次好了
    this.once( 'disconnect' ,
      /**
       * 当连接断开时，告诉所有等待响应的消息一个错误
       * @param {Boolean} isByOtherSide - 连接是否是被另一端断开的
       */
      isByOtherSide => {
        this.disconnected = true;
        this.disconnect = noop;
        for ( let key in waitingResponseMsg ) {
          waitingResponseMsg[ key ]( new Error( `Connection has been disconnected by ${isByOtherSide ? 'the other side' : 'yourself.'}.` ) );
          delete waitingResponseMsg[ key ];
        }
      } );
  }

  /**
   * 发送消息到另一端
   * @param {String} name - 消息名称
   * @param {*} [data] 数据
   * @param {Boolean} [needResponse] - 如果是 true，则此方法返回一个 Promise，当得到相应时会被 resolve 或 reject。
   *
   * @example
   * send('name','data',true)
   * send('name',true) - 这种情况下，data 为 undefined，needResponse 为 true
   * send('name','data')
   * send('name')
   */
  send( name , data , needResponse ) {
    if ( data === true && arguments.length === 2 ) {
      data = undefined;
      needResponse = true;
    }
    const msg = { name , data };
    let p;
    if ( needResponse ) {
      p = new Promise( ( resolve , reject )=> {
        this._waiting[ msg.id = uuid() ] = ( error , response )=> {
          if ( error ) {
            reject( error );
          } else {
            resolve( response );
          }
        };
      } );
    }
    this.port.postMessage( msg );
    return p;
  }

  /**
   * 主动断开与远程端口的连接
   */
  disconnect() {
    if ( !this.disconnected ) {
      this.port.disconnect();
      this.emit( 'disconnect' , false );
    }
  }
}

/**
 * 用一个类来描述 port 之间传递的消息。
 * 消息分为两种：请求消息与响应消息。
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
 *
 * @property {String} id - 消息的 uuid
 *
 * @property {*} response - 如果消息是一次响应，则此属性为远程端口响应的数据
 * @property {*} error - 如果消息是一次响应，则此属性为远程端口响应的错误消息
 */
