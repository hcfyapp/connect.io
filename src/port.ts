/**
 * @fileOverview 包装一层 Chrome 的 Port 对象，使用自定义的消息格式
 */

import TinyEmitter from 'tinyemitter'
import uuid from './utils/uuid'
import noop from './utils/noop'

/** 请求消息体 */
export interface IRequestMessage {
  /** 如果期望得到回复消息，则需要声明 id */
  id?: string
  /** 消息名称 */
  name: string
  /** 此消息携带的数据 */
  data: any
}

/** 响应消息体 */
export interface IResponseMessage {
  /** 这个 id 等同于请求消息体中携带的 id */
  id: string
  /** reslove 的数据放在 response 上 */
  response?: any
  /** reject 的数据放在 error 上 */
  error?: any
}

interface IWatingMap {
  [id: string]: (error: any, response?: any) => void
}

export default class Port extends TinyEmitter {
  private disconnected: boolean
  private _waiting: IWatingMap
  private port: chrome.runtime.Port

  constructor(port: chrome.runtime.Port) {
    super()
    this.disconnected = false

    const waitingResponseMsg = (this._waiting = {} as IWatingMap)
    this.port = port

    // @ts-ignore
    port.onMessage.addListener((msg: IRequestMessage | IResponseMessage) => {
      const { id } = msg

      if (id) {
        // 如果这个 id 有对应的回调函数，则说明这个消息是由远程端口回复的消息，
        // 此时直接调用回调函数就可以了
        const cb = waitingResponseMsg[id]
        if (cb) {
          delete waitingResponseMsg[id]
          cb(
            (msg as IResponseMessage).error,
            (msg as IResponseMessage).response
          )
        } else {
          // 如果这个 id 没有对应的回调函数，则说明这个消息是由远程端口发送给本地端口的消息，并且期望得到回复，
          // 此时需要发布这个事件并将 id 携带在回复中
          new Promise((resolve, reject) => {
            this.emit(
              (msg as IRequestMessage).name,
              (msg as IRequestMessage).data,
              resolve,
              reject
            )
          }).then(
            response => {
              port.postMessage({ id, response })
            },
            error => {
              port.postMessage({ id, error })
            }
          )
        }
      } else {
        // 如果没有 id，则说明这个消息是由远程端口发送给本地端口的消息，且不期望得到回复，
        // 此时只需要发布这个事件就可以了
        this.emit(
          (msg as IRequestMessage).name,
          (msg as IRequestMessage).data,
          noop,
          noop
        )
      }
    })

    // 进入这个回调说明连接是被远程端口断开的
    port.onDisconnect.addListener(() => {
      this.emit('disconnect', true)
    })
    /**
       * 当连接断开时，告诉所有等待响应的消息一个错误
       * @param isByOtherSide - 连接是否是被另一端断开的
       */
    const disconnectHandle = (isByOtherSide: boolean) => {
      const error = new Error(
        `Connection has been disconnected by ${isByOtherSide
          ? 'the other side'
          : 'yourself'}.`
      )
      this.disconnected = true
      this.disconnect = noop
      this.send = function() {
        throw error
      }
      for (let key in waitingResponseMsg) {
        waitingResponseMsg[key](error)
        delete waitingResponseMsg[key]
      }
    }

    this.on('disconnect', disconnectHandle)
  }

  /**
   * 发送消息到另一端
   * @param name - 消息名称
   * @param data - 数据
   * @param needResponse - 如果是 true，则此方法返回一个 Promise，当得到相应时会被 resolve 或 reject。
   *
   * @example
   * send('name', 'data', true)
   * send('name', true) - 这种情况下，data 为 undefined，needResponse 为 true
   * send('name', 'data')
   * send('name')
   */
  send(
    name: string,
    data?: any,
    needResponse = false
  ): Promise<any> | undefined {
    if (data === true && arguments.length === 2) {
      data = undefined
      needResponse = true
    }
    const msg: IRequestMessage = {
      name: name,
      data: data
    }
    let p
    if (needResponse) {
      p = new Promise((resolve, reject) => {
        this._waiting[(msg.id = uuid())] = function(error, response) {
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        }
      })
    }
    this.port.postMessage(msg)
    return p
  }

  /**
   * 主动断开与远程端口的连接，
   * 此时不会触发 port.onDisconnect 事件。
   */
  disconnect() {
    this.port.disconnect()
    this.emit('disconnect', false)
  }
}
