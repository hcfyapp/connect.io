import Client from '../../libs/client'
import noop from '../../libs/noop'

describe('Client 构造函数', () => {
  beforeEach(() => {
    spyOn(chrome.runtime, 'connect').and.callThrough()
    spyOn(chrome.tabs, 'connect').and.callThrough()
  })

  it('默认使用 runtime.connect 创建端口', () => {
    new Client()
    expect(chrome.runtime.connect.calls.count()).toBe(1)

    new Client({})
    expect(chrome.runtime.connect.calls.count()).toBe(2)
  })

  it('如果第一个参数是数字，则作为 tabId 并调用 tabs.connect', () => {
    new Client(45)
    expect(chrome.tabs.connect).toHaveBeenCalled()
  })

  it('若忽略了第一个参数但 runtime.id 是 undefined，则抛出错误', () => {
    try {
      // 当在普通网页中调用 new Client() 时，chrome.runtime.id 是 undefined。
      // 这里传了一个不是 object、string 和 number 的值(一个函数)来模拟此现象。
      new Client(noop)
      fail('没有抛出错误')
    }
    catch (e) {}
  })
})
