import prod from './_prod'
import os from 'os'

export default {

  // 文件上传的临时文件保存地址
  // 临时文件 bucky 会自动删除
  fileTempDir: prod.base.MATRIX_PRIVDATA_DIR
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {
  fileTempDir: os.tmpdir()
}
// 测试环境配置
export const testing = {
 fileTempDir: os.tmpdir()
}