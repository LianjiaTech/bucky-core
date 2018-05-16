const match = require('../../lib/utils/match')
const { expect } = require('chai')

describe('测试类型判断 utils/match', () => {

  it('测试正则表达式', () => {
    const matched = match('/test/abc', /^\/test\/([a-z]+)$/)
    expect( matched.slice() ).to.deep.equal( ['/test/abc', 'abc'] )
  })

  it('测试函数', () => {
    const matched = match('/test/abc', (arg) => {
      expect( arg ).to.equal( '/test/abc' )
      return 123
    })
    expect( matched ).to.deep.equal( [ '/test/abc', 123 ] )
  })

  it('测试 minimatch', () => {
    const matched = match('/test/abc', '/**/abc')
    expect( matched ).to.deep.equal( ['/test/abc'] )
  })

})