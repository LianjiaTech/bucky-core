// redis 配置。 redis 使用参见 http://devdocs.io/redis/

export default {

  // 配置一个名为 "cache" 的 redis
  // 参见 http://redis.js.org/#api-rediscreateclient
  cache: {
    host: '127.0.0.1',
    port: '6379',
  }
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
export const development = {}
// 测试环境配置
export const testing = {}


// 使用方式

// const result = await Redis.cache(async redis => {
//   await redis.hset(cacheKey, name, value)
//   return await redis.hget(cacheKey, name)
// })

// await Redis.cache.hashCache.get('some_name', 'some_value')
// await Redis.cache.hashCache.set('some_name')