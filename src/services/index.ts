import {
  useBilibiliHotSearch,
  useBilibiliHotVideo,
  useBilibiliRanking,
} from './bilibili.service'

export const trendingServices = {
  'bilibili-hot-search': {
    title: 'Bilibili Hot Search',
    hook: useBilibiliHotSearch,
  },
  'bilibili-hot-video': {
    title: 'Bilibili Hot Video',
    hook: useBilibiliHotVideo,
  },
  'bilibili-ranking': {
    title: 'Bilibili Ranking',
    hook: useBilibiliRanking,
  },
}

export type TrendingServiceKey = keyof typeof trendingServices
