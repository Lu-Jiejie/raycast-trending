export const serviceDefinitions = [
  {
    id: 'bilibili-hot-search',
    title: {
      en: 'Bilibili (Hot Search)',
      zh: '哔哩哔哩(热搜)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://search.bilibili.com/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'bilibili-hot-video',
    title: {
      en: 'Bilibili (Hot Video)',
      zh: '哔哩哔哩(热门视频)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'bilibili-ranking',
    title: {
      en: 'Bilibili (Ranking)',
      zh: '哔哩哔哩(全站排行)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/rank/all',
    homepage: 'https://www.bilibili.com',
  },
  {
    id: 'tieba-hot-topic',
    title: {
      en: 'Tieba (Hot Topic)',
      zh: '百度贴吧(热议)',
    },
    icon: 'icons/tieba.png',
    page: 'https://tieba.baidu.com/hottopic/browse/topicList?res_type=1',
    homepage: 'https://tieba.baidu.com',
  },
  {
    id: 'douyin-hot-search',
    title: {
      en: 'Douyin (Hot Search)',
      zh: '抖音(热搜)',
    },
    icon: 'icons/douyin.png',
    page: 'https://www.douyin.com/hot',
    homepage: 'https://www.douyin.com',
  },
  {
    id: 'weibo-hot-search',
    title: {
      en: 'Weibo (Hot Search)',
      zh: '微博(热搜)',
    },
    icon: 'icons/weibo.png',
    page: 'https://weibo.com/hot/search',
    homepage: 'https://www.weibo.com',
  },
] as const

export type TrendingType = typeof serviceDefinitions[number]['id']
export type ServiceConfig = typeof serviceDefinitions[number]
