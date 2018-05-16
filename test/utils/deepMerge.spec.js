const deepMerge = require('../../lib/utils/deepMerge')
const { expect } = require('chai')

describe('测试类型判断 utils/deepMerge', () => {

  it('测试简单 merge', () => {
    const result = deepMerge({ a: 1, b: 2 }, { a: 11, c: 33 })
    expect( result ).to.deep.equal({ a: 11, b: 2, c: 33 })
  })

  it('测试多层 merge', () => {
    const result = deepMerge(
      { a: { aa: 1, ab: 2, ad: { ada: 1 } }, b: 2 },
      { a: { aa: 1, ac: 2, ad: { ada: 2 } }, c: 33 }
    )
    expect( result ).to.deep.equal(
      { a: { aa: 1, ab: 2, ac: 2, ad: { ada: 2 } }, b: 2, c: 33 }
    )
  })

  it('测试 merge 到第一个参数', () => {
    const willChange = { a: 1, b: 2 }
    const result = deepMerge(willChange, { a: 2 })
    expect( willChange ).to.deep.equal( result )
  })

  it('测试 merge 不影响后续参数', () => {
    const notChange = { a: 2 }
    const result = deepMerge({ a: 1, b: 2 }, notChange, { a: 3 })
    expect( notChange ).to.equal( notChange )
  })

  it('测试 跳过 undefined', () => {
    const result = deepMerge(
      {}, undefined,
      { a: { aa: 1, ab: 2, ad: { ada: 1 } }, b: 2 },
      { a: { aa: 1, ac: 2, ad: { ada: 2 } }, c: 33 }
    )
    expect( result ).to.deep.equal(
      { a: { aa: 1, ab: 2, ac: 2, ad: { ada: 2 } }, b: 2, c: 33 }
    )
  })

})