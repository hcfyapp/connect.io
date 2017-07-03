import uuid from '../../libs/utils/uuid'

describe('uuid 函数', function () {
  it('返回一个 string', function () {
    expect(typeof uuid()).toBe('string')
  })

  it('多次返回的值都不相同', function () {
    var m = []
    for (var i = 0; i < 10000; i += 1) {
      m[i] = uuid()
    }

    var map = {}

    m.some(function (v) {
      if (map[v]) {
        fail('uuid 的返回值中有重复元素：' + v)
        return true
      } else {
        map[v] = 1
      }
    })
  })
})
