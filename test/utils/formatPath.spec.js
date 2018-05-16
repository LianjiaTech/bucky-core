const formatPath = require('../../lib/utils/formatPath')
const { expect } = require('chai')

describe('测试类型判断 utils/formatPath', () => {

  it('测试 转化是否正确', () => {
    const result = formatPath('/fsdfsd/fdsfdsf//fds///dfsds/')
    expect( result ).to.equal('/fsdfsd/fdsfdsf/fds/dfsds')
  })

})