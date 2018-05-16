import fs from 'fs'
import ini from 'ini'

// 获取 op 的配置项

const hostName = 'bucky'
const filePath = `/a/b/c/CONFIG`

let config = {base: {}, mysql: {}, redis: {}}
try {
  if (fs.existsSync(filePath))
    config = ini.parse(fs.readFileSync(filePath, 'utf-8'))
} catch (e) {}

export default config