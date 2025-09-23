import { use52PojieHotPost } from '../sources/52pojie'
import { useBilibiliHotSearch, useBilibiliHotVideo, useBilibiliRanking } from '../sources/bilibili'
import { useDoubanNewMovie } from '../sources/douban'
import { useDouyinHotSearch } from '../sources/douyin'
import { useGithubTrendingToday } from '../sources/github'
import { useJuejinHotPost } from '../sources/juejin'
import { useThepaperHotNews } from '../sources/thepaper'
import { useTiebaHotTopic } from '../sources/tieba'
import { useToutiaoHotNews } from '../sources/toutiao'
import { useWeiboHotSearch } from '../sources/weibo'
import { useZhihuHotTopic } from '../sources/zhihu'

function defineSourceInfo<T extends readonly {
  id: string
  title: { en: string, zh: string }
  subTitle: { en: string, zh: string }
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
      en: 'Bilibili',
      zh: '哔哩哔哩',
    },
    subTitle: {
      en: 'Hot Search',
      zh: '热搜',
    },
    icon: 'icons/bilibili.png',
    page: 'https://search.bilibili.com/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliHotSearch,
  },
  {
    id: 'bilibili-hot-video',
    title: {
      en: 'Bilibili',
      zh: '哔哩哔哩',
    },
    subTitle: {
      en: 'Hot Videos',
      zh: '热门视频',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliHotVideo,
  },
  {
    id: 'bilibili-ranking',
    title: {
      en: 'Bilibili',
      zh: '哔哩哔哩',
    },
    subTitle: {
      en: 'Ranking',
      zh: '全站排行',
    },
    icon: 'icons/bilibili.png',
    page: 'https://www.bilibili.com/v/popular/rank/all',
    homepage: 'https://www.bilibili.com',
    hook: useBilibiliRanking,
  },
  {
    id: 'douyin-hot-search',
    title: {
      en: 'Douyin',
      zh: '抖音',
    },
    subTitle: {
      en: 'Hot Search',
      zh: '热搜',
    },
    icon: 'icons/douyin.png',
    page: 'https://www.douyin.com/hot',
    homepage: 'https://www.douyin.com',
    hook: useDouyinHotSearch,
  },
  {
    id: 'thepaper-hot-news',
    title: {
      en: 'The Paper',
      zh: '澎湃新闻',
    },
    subTitle: {
      en: 'Hot News',
      zh: '热点',
    },
    icon: 'icons/thepaper.png',
    page: 'https://www.thepaper.cn',
    homepage: 'https://www.thepaper.cn',
    hook: useThepaperHotNews,
  },
  {
    id: 'tieba-hot-topic',
    title: {
      en: 'Tieba',
      zh: '百度贴吧',
    },
    subTitle: {
      en: 'Hot Topic',
      zh: '热议',
    },
    icon: 'icons/tieba.png',
    page: 'https://tieba.baidu.com/hottopic/browse/topicList?res_type=1',
    homepage: 'https://tieba.baidu.com',
    hook: useTiebaHotTopic,
  },
  {
    id: 'toutiao-hot-news',
    title: {
      en: 'Toutiao',
      zh: '今日头条',
    },
    subTitle: {
      en: 'Hot News',
      zh: '热点',
    },
    icon: 'icons/toutiao.png',
    page: 'https://www.toutiao.com',
    homepage: 'https://www.toutiao.com',
    hook: useToutiaoHotNews,
  },
  {
    id: 'weibo-hot-search',
    title: {
      en: 'Weibo',
      zh: '微博',
    },
    subTitle: {
      en: 'Hot Search',
      zh: '热搜',
    },
    icon: 'icons/weibo.png',
    page: 'https://weibo.com/hot/search',
    homepage: 'https://www.weibo.com',
    hook: useWeiboHotSearch,
  },
  {
    id: 'zhihu-hot-topic',
    title: {
      en: 'Zhihu',
      zh: '知乎',
    },
    subTitle: {
      en: 'Hot Topic',
      zh: '热榜',
    },
    icon: 'icons/zhihu.png',
    page: 'https://www.zhihu.com/hot',
    homepage: 'https://www.zhihu.com',
    hook: useZhihuHotTopic,
  },
  {
    id: 'juejin-hot-post',
    title: {
      en: 'Juejin',
      zh: '稀土掘金',
    },
    subTitle: {
      en: 'Hot Post',
      zh: '热门文章',
    },
    icon: 'icons/juejin.png',
    page: 'https://juejin.cn/hot/articles',
    homepage: 'https://juejin.cn',
    hook: useJuejinHotPost,
  },
  {
    id: 'github-trending-today',
    title: {
      en: 'GitHub',
      zh: 'GitHub',
    },
    subTitle: {
      en: 'Trending Today',
      zh: '今日趋势',
    },
    icon: { light: 'icons/github.png', dark: 'icons/github@dark.png' },
    page: 'https://github.com/trending?since=daily',
    homepage: 'https://github.com',
    hook: useGithubTrendingToday,
  },
  {
    id: 'douban-new-movie',
    title: {
      en: 'Douban',
      zh: '豆瓣',
    },
    subTitle: {
      en: 'New Movie',
      zh: '新片榜',
    },
    icon: 'icons/douban.png',
    page: 'https://movie.douban.com/chart',
    homepage: 'https://www.douban.com',
    hook: useDoubanNewMovie,
  },
  {
    id: '52pojie-hot-post',
    title: {
      en: '52pojie',
      zh: '吾爱破解',
    },
    subTitle: {
      en: 'Hot Post',
      zh: '热帖',
    },
    icon: 'icons/52pojie.png',
    page: 'https://www.52pojie.cn/forum.php?mod=forumdisplay&fid=2',
    homepage: 'https://www.52pojie.cn',
    hook: use52PojieHotPost,
  },
] as const)

export type SourceType = (typeof sourceInfo)[number]['id']
export type SourceInfo = (typeof sourceInfo)[number]
