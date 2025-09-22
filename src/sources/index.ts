import { useBilibiliHotSearch, useBilibiliHotVideo, useBilibiliRanking } from './bilibili'
import { useDouyinHotSearch } from './douyin'
import { useGithubTrendingToday } from './github'
import { useJuejinHotPost } from './juejin'
import { useThepaperHotNews } from './thepaper'
import { useTiebaHotTopic } from './tieba'
import { useToutiaoHotNews } from './toutiao'
import { useWeiboHotSearch } from './weibo'
import { useZhihuHotTopic } from './zhihu'

function defineSourceInfo<T extends readonly {
  id: string
  title: { en: string, zh: string }
  icon: string | { light: string, dark: string }
  page: string
  homepage: string
  hook: () => any
}[]>(sources: T): T {
  return sources
}

export const sourceInfo = defineSourceInfo([
  {
    id: 'bilibili-hot-search',
    title: {
      en: 'Bilibili (Hot Search)',
      zh: '哔哩哔哩 (热搜)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://search.bilibili.com/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliHotSearch,
  },
  {
    id: 'bilibili-hot-video',
    title: {
      en: 'Bilibili (Hot Video)',
      zh: '哔哩哔哩 (热门视频)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliHotVideo,
  },
  {
    id: 'bilibili-ranking',
    title: {
      en: 'Bilibili (Ranking)',
      zh: '哔哩哔哩 (全站排行)',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/rank/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliRanking,
  },
  {
    id: 'douyin-hot-search',
    title: {
      en: 'Douyin (Hot Search)',
      zh: '抖音 (热搜)',
    },
    icon: 'icons/douyin.png',
    page: 'https://www.douyin.com/hot',
    homepage: 'https://www.douyin.com',
    hook: useDouyinHotSearch,
  },
  {
    id: 'thepaper-hot-news',
    title: {
      en: 'The Paper (Hot News)',
      zh: '澎湃新闻',
    },
    icon: 'icons/thepaper.png',
    page: 'https://www.thepaper.cn',
    homepage: 'https://www.thepaper.cn',
    hook: useThepaperHotNews,
  },
  {
    id: 'tieba-hot-topic',
    title: {
      en: 'Tieba (Hot Topic)',
      zh: '百度贴吧 (热议)',
    },
    icon: 'icons/tieba.png',
    page: 'https://tieba.baidu.com/hottopic/browse/topicList?res_type=1',
    homepage: 'https://tieba.baidu.com',
    hook: useTiebaHotTopic,
  },
  {
    id: 'toutiao-hot-news',
    title: {
      en: 'Toutiao (Hot News)',
      zh: '今日头条',
    },
    icon: 'icons/toutiao.png',
    page: 'https://www.toutiao.com',
    homepage: 'https://www.toutiao.com',
    hook: useToutiaoHotNews,
  },
  {
    id: 'weibo-hot-search',
    title: {
      en: 'Weibo (Hot Search)',
      zh: '微博 (热搜)',
    },
    icon: 'icons/weibo.png',
    page: 'https://weibo.com/hot/search',
    homepage: 'https://www.weibo.com',
    hook: useWeiboHotSearch,
  },
  {
    id: 'zhihu-hot-topic',
    title: {
      en: 'Zhihu (Hot Topic)',
      zh: '知乎 (热榜)',
    },
    icon: 'icons/zhihu.png',
    page: 'https://www.zhihu.com/hot',
    homepage: 'https://www.zhihu.com',
    hook: useZhihuHotTopic,
  },
  {
    id: 'juejin-hot-post',
    title: {
      en: 'Juejin (Hot Post)',
      zh: '稀土掘金 (热门文章)',
    },
    icon: 'icons/juejin.png',
    page: 'https://juejin.cn/hot/articles',
    homepage: 'https://juejin.cn',
    hook: useJuejinHotPost,
  },
  {
    id: 'github-trending-today',
    title: {
      en: 'GitHub (Trending Today)',
      zh: 'GitHub (今日趋势)',
    },
    icon: { light: 'icons/github.png', dark: 'icons/github@dark.png' },
    page: 'https://github.com/trending?since=daily',
    homepage: 'https://github.com',
    hook: useGithubTrendingToday,
  },
] as const)

export type SourceType = typeof sourceInfo[number]['id']
export type SourceInfo = typeof sourceInfo[number]
