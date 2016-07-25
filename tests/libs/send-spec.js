import Port from '../../libs/port'
import send from '../../libs/send'
import noop from '../../libs/noop'

describe('send 方法', () => {
  let mockPort

  beforeEach(() => {
    mockPort = new chrome.__types.Port()
    spyOn(mockPort, 'disconnect')
    spyOn(chrome.runtime, 'connect').and.returnValue(mockPort)
  })

  it('如果此消息不需要响应，则会在发送消息之后立刻断开', () => {
    send({
      name: 'x'
    })
    expect(mockPort.disconnect).toHaveBeenCalled()
  })

  it('如果此消息需要响应，则会在响应后断开连接', done => {
    spyOn(Port.prototype, 'send').and.returnValue(Promise.resolve())
    send({ name: 'x' }).then(() => {
      expect(mockPort.disconnect.calls.count()).toBe(1)

      Port.prototype.send.and.stub().and.returnValue(Promise.reject())
      send({ name: 'x' }).then(noop, noop).then(() => {
        expect(mockPort.disconnect.calls.count()).toBe(2)
        done()
      })
    })
  })
})
