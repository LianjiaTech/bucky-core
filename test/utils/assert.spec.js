const assert = require('../../lib/utils/assert')
const { expect } = require('chai')

const message = 'message'

describe('测试断言 utils/assert', () => {

  it('如果命中 true, throw error', () => {
    expect( () => assert(true, message) ).to.throw(Error)
  })

  it('如果没有命中 true, 不 throw error', () => {
    expect( () => assert(false, message) ).to.not.throw()
    expect( () => assert('', message) ).to.not.throw()
    expect( () => assert(0, message) ).to.not.throw()
    expect( () => assert(NaN, message) ).to.not.throw()
    expect( () => assert([], message) ).to.not.throw()
  })

  it('如果命中 true, 返回 message', () => {
    expect( () => assert(true, message) ).to.throw('Bucky: ' + message)
  })

  it('如果命中 true, 返回 message, 并且通过 %s 注入参数', () => {
    expect( () => assert(true, 'got error with %s', message) )
      .to.throw('Bucky: got error with ' + JSON.stringify(message))
  })

  it('如果命中 true, 返回 message, 并且通过 %s 注入参数 (两个或者多个参数)', () => {
    expect( () => assert(true, 'got %s error with %s', 1, message) )
      .to.throw('Bucky: got 1 error with ' + JSON.stringify(message))
  })

})