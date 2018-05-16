const getType = require('../../lib/utils/getType')
const { expect } = require('chai')

const types = 'Boolean Number String Function Array Date RegExp Object Error'

describe('测试类型判断 utils/getType', () => {

  types.split(' ').forEach(type => {
    it(`测试 ${type} 类型`, () => {
      expect( getType(new global[type]) ).to.equal( type.toLowerCase() )
    })
  })
  it('测试 undefined 类型', () => {
      expect( getType(undefined) ).to.equal('undefined')
  })
  it('测试 null 类型', () => {
      expect( getType(null) ).to.equal('null')
  })

  describe('测试类型判断 utils/getType.checker', () => {

    const checkers = {}

    types.split(' ').forEach(type => {
      checkers[type] = getType.checker( type.toLowerCase() )
    })

    types.split(' ').forEach(type => {
      it(`测试 ${type} 类型`, () => {
        expect( checkers[type](new global[type]) ).to.be.true
        expect( checkers[type](undefined) ).to.be.true
      })
      it(`测试 ${type}.required 类型`, () => {
        expect( checkers[type].required(new global[type]) ).to.be.true
        expect( checkers[type].required(undefined) ).to.be.false
      })
    })

  })
})