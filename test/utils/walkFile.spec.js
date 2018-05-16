const path = require('path')
const walkFile = require('../../lib/utils/walkFile')
const { expect } = require('chai')


describe('测试文件遍历 utils/walkFile', () => {

  it('使用 ./test_walkFile 检测', () => {
    const filePaths = []
    walkFile(path.join(__dirname, 'test_walkFile'), filePath => {
      filePaths.push(filePath)
    })
    expect(filePaths).deep.equal([
      path.join(__dirname, 'test_walkFile'),
      path.join(__dirname, 'test_walkFile', 'bbb.js')
    ])
  })

  it('使用 ./test_walkFile 检测, 深度', () => {
    const filePaths = []
    walkFile(path.join(__dirname, 'test_walkFile'), filePath => {
      filePaths.push(filePath)
    }, {deep: true})
    expect(filePaths).deep.equal([
      path.join(__dirname, 'test_walkFile'),
      path.join(__dirname, 'test_walkFile', 'aaa'),
      path.join(__dirname, 'test_walkFile', 'aaa', 'aaa_aaa.js'),
      path.join(__dirname, 'test_walkFile', 'bbb.js')
    ])
  })

})
