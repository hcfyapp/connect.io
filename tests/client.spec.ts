import createClient from '../src/client'
import noop from '../src/utils/noop'

describe('Client 构造函数', () => {
  beforeEach(() => {
    spyOn(chrome.runtime, 'connect').and.callThrough()
    spyOn(chrome.tabs, 'connect').and.callThrough()
  })

  it('默认使用 runtime.connect 创建端口', () => {
    createClient()
    expect((chrome.runtime.connect as jasmine.Spy).calls.count()).toBe(1)

    createClient({})
    expect((chrome.runtime.connect as jasmine.Spy).calls.count()).toBe(2)
  })

  it('如果第一个参数是数字，则作为 tabId 并调用 tabs.connect', () => {
    createClient(45)
    expect(chrome.tabs.connect).toHaveBeenCalled()
  })

  it('若忽略了第一个参数但 runtime.id 是 undefined，则抛出错误', () => {
    try {
      // 当在外部网页中调用 createClient() 时，chrome.runtime.id 是 undefined。
      // 这里传了一个不是 object、string 和 number 的值(一个函数)来模拟此现象。
      // @ts-ignore
      createClient(noop)
      fail('没有抛出错误')
    } catch (e) {}
  })
})
