import createClient from '../../libs/client'
import noop from '../../libs/utils/noop'

describe('Client 构造函数', function () {
  beforeEach(function () {
    spyOn(chrome.runtime, 'connect').and.callThrough()
    spyOn(chrome.tabs, 'connect').and.callThrough()
  })

  it('默认使用 runtime.connect 创建端口', function () {
    createClient()
    expect(chrome.runtime.connect.calls.count()).toBe(1)

    createClient({})
    expect(chrome.runtime.connect.calls.count()).toBe(2)
  })

  it('如果第一个参数是数字，则作为 tabId 并调用 tabs.connect', function () {
    createClient(45)
    expect(chrome.tabs.connect).toHaveBeenCalled()
  })

  it('若忽略了第一个参数但 runtime.id 是 undefined，则抛出错误', function () {
    try {
      // 当在外部网页中调用 createClient() 时，chrome.runtime.id 是 undefined。
      // 这里传了一个不是 object、string 和 number 的值(一个函数)来模拟此现象。
      createClient(noop)
      fail('没有抛出错误')
    } catch (e) {}
  })
})
