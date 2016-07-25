import Port from '../../libs/port'
import noop from '../../libs/noop'

describe('端口对象', () => {

  describe('在收到远程端口发送过来的消息时', () => {
    let chromePort, port, onMessageCb
    beforeEach(() => {
      chromePort = new chrome.__types.Port()
      spyOn(chromePort.onMessage, 'addListener').and.callFake(cb => onMessageCb = cb)
      port = new Port(chromePort)
      spyOn(port, 'emit')
      spyOn(chromePort, 'postMessage')
    })

    it('如果远程端口传过来的消息没有 id 则直接触发对应事件', () => {
      onMessageCb({
        name: 'hi'
      })
      expect(port.emit).toHaveBeenCalledWith('hi', undefined, noop, noop)
    })

    describe('如果远程端口传过来的消息有 id', () => {

      describe('且此 id 不在本地端口的待响应列表里', () => {

        it('当消息 resolved 时会发送响应', done => {
          // 则说明这个消息是远程端口发送过来的需要响应的消息
          port.emit.and.callFake((name, data, resolve, reject)=> {
            resolve('res')
            setTimeout(() => {
              expect(chromePort.postMessage).toHaveBeenCalledWith({
                id: 'not in list',
                response: 'res'
              })
              done()
            }, 0)
          })
          onMessageCb({ id: 'not in list', name: 'hi' })
        })

        it('当消息 rejected 时也会发送响应', done => {
          port.emit.and.callFake((name, data, resolve, reject)=> {
            reject('error')
            setTimeout(() => {
              expect(chromePort.postMessage).toHaveBeenCalledWith({
                id: 'not in list',
                error: 'error'
              })
              done()
            }, 0)
          })
          onMessageCb({ id: 'not in list', name: 'hi' })
        })
      })

      describe('且此 id 在本地端口的待响应列表里', () => {
        // 这说明这个消息是有本地端口发送给远程端口之后，远程端口给的回复
        it('则会调用对应 id 的回调函数', () => {
          const s = port._waiting.someId = jasmine.createSpy('s')

          onMessageCb({ id: 'someId', response: 'y', error: 'no' })

          expect(s).toHaveBeenCalledWith('no', 'y')
        })
      })
    })
  })

  describe('如果端口在发送了需要响应的消息后连接被断开', () => {
    let chromePort, port

    beforeEach(() => {
      chromePort = new chrome.__types.Port()
      port = new Port(chromePort)
    })

    it('则会通知待响应列表里的每一个回调函数', () => {
      const s = port._waiting.someId = jasmine.createSpy('waiting list spy')
      port.emit('disconnect', false)
      expect(s).toHaveBeenCalledWith(new Error('Connection has been disconnected by yourself.'))
      expect(port._waiting.someId).toBeUndefined()

      try {
        // 断开后再发送消息会抛出错误
        port.send()
        fail('没有抛出错误')
      }
      catch (e) {}
    })

    it('若连接是由远程端口断开的则变更错误消息', () => {
      const s = port._waiting.someId = jasmine.createSpy('waiting list spy')
      port.emit('disconnect', true)
      expect(s).toHaveBeenCalledWith(new Error('Connection has been disconnected by the other side.'))
    })
  })

  describe('发送消息时', () => {
    let chromePort, port

    beforeEach(() => {
      chromePort = new chrome.__types.Port()
      port = new Port(chromePort)
      spyOn(chromePort, 'postMessage')
    })

    it('若只有两个参数且第二个参数是 true 则视为一个需要响应的消息', () => {
      const p = port.send('x', true)
      expect(p instanceof Promise).toBe(true)
      expect(chromePort.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
        name: 'x',
        data: undefined
      }))
    })

    describe('若消息需要响应', () => {
      it('则返回 Promise', () => {
        const p = port.send('x', 'y', true)
        expect(p instanceof Promise).toBe(true)
      })

      it('会在待响应列表里注册一个函数', (done)=> {
        port.send('x', 'y', true)
          .then(response => {
            expect(response).toBe('success response')
            done()
          })

        const cb = port._waiting[Object.keys(port._waiting)[0]]
        cb(null, 'success response')
      })

      it('会在待响应列表里注册一个函数2', (done)=> {
        port.send('x', 'y', true)
          .catch(error => {
            expect(error).toBe('error message')
            done()
          })

        const cb = port._waiting[Object.keys(port._waiting)[0]]
        cb('error message')
      })
    })
  })
})
