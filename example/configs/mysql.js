// mysql 配置。 mysql 使用参见 https://dev.mysql.com/doc/refman/8.0/en/

export default {

  // 配置一个名为 "store" 的 mysql
  // 参见 https://www.npmjs.com/package/mysql#pooling-connections
  // store: {
  //   host: '127.0.0.1',
  //   port: '3306',
  //   user: 'root',
  //   password: '123456',
  //   database: 'test'
  // }
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {}
// 测试环境配置
export const testing = {}

// 用法
// 可以使用 https://www.npmjs.com/package/sql 来声称 sql
// const items = await MySQL.store(async store => {
//   return await store.query(`select * from pet where name='${name}'`)
// })
// await MySQL.store(async store => {
//   await store.query(`insert into pet(type, name) values('${type}','${name}')`)
// })