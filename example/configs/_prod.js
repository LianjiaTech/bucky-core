// 获取服务器项目相关配置 如端口等
import fs from 'fs'
import ini from 'ini'

// 获取 op 的配置项

const hostName = 'bucky'
const filePath = `/buckydemo/CONFIG` //服务器端项目相关配置

let config = {base: {}, mysql: {}, redis: {}}
try {
  if (fs.existsSync(filePath))
    config = ini.parse(fs.readFileSync(filePath, 'utf-8'))
} catch (e) {}

export default config