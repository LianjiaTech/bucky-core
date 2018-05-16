const string2Array = require('../../lib/utils/string2Array')
const { expect } = require('chai')


describe('测试字符串转数组 utils/string2Array', () => {

  it('转化数组，用逗号分隔', () => {
    const result = string2Array(`    aaa ,  bbb,
      ccc   `)
    expect(result).deep.equal(['aaa', 'bbb', 'ccc'])
  })

  it('转化数组，用自定义(-)分隔', () => {
    const result = string2Array(`    aaa  -  bbb -
      ccc   `, '-')
    expect(result).deep.equal(['aaa', 'bbb', 'ccc'])
  })

})
