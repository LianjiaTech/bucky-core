const objectForEach = require('../../lib/utils/objectForEach')
const { expect } = require('chai')

const object = {
  'number': 1,
  'string': 'string',
  'regExp': /\d+/,
  'function': () => {},
  'object': {}
}

describe('测试对象循环 utils/objectForEach', () => {

  it('每个值都循环到', () => {
    let count = 0
    objectForEach(object, () => count++)
    expect( count ).to.equal(5)
  })

  it('入参是 value, key', () => {
    objectForEach({'key': 'value'}, (value, key) => {
      expect( value ).to.equal('value')
      expect( key ).to.equal(key)
    })
  })

  it('入参是 value 的值类型正确', () => {
    objectForEach(object, (value, type) => expect( value ).to.be.a(type))
  })

  it('返回值是个对象, 返回对应key, return 的值为 value', () => {
    expect( objectForEach(object, value => value) ).to.deep.equal(object)
    expect( objectForEach({a: 1}, value => value + 1) ).to.deep.equal({a: 2})
  })

})
