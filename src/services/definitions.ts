export const serviceDefinitions = [
  {
    id: 'bilibili-hot-search',
    title: 'Bilibili (Hot Search)',
    icon: 'icons/bilibili.png',
    page: 'https://search.bilibili.com/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'bilibili-hot-video',
    title: 'Bilibili (Hot Video)',
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'bilibili-ranking',
    title: 'Bilibili (Ranking)',
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/rank/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'tieba-hot-topic',
    title: 'Tieba (Hot Topic)',
    icon: 'icons/tieba.png',
    page: 'https://tieba.baidu.com/hottopic/browse/topicList?res_type=1',
    homepage: 'https://tieba.baidu.com',
  },
  {
    id: 'douyin-hot-search',
    title: 'Douyin (Hot Search)',
    icon: 'icons/douyin.png',
    page: 'https://www.douyin.com/hot',
    homepage: 'https://www.douyin.com',
  },
  {
    id: 'weibo-hot-search',
    title: 'Weibo (Hot Search)',
    icon: 'icons/weibo.png',
    page: 'https://weibo.com/hot/search',
    homepage: 'https://www.weibo.com',
  },
] as const

export type TrendingType = typeof serviceDefinitions[number]['id']
export type ServiceConfig = typeof serviceDefinitions[number]
