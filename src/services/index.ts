import {
  useBilibiliHotSearch,
  useBilibiliHotVideo,
  useBilibiliRanking,
} from './bilibili.service'
import { useDouyinHotSearch } from './douyin.service'
import { useTiebaHotTopic } from './tieba.service'

export const trendingServices = {
  'bilibili-hot-search': {
    title: 'Bilibili (Hot Search)',
    hook: useBilibiliHotSearch,
  },
  'bilibili-hot-video': {
    title: 'Bilibili (Hot Video)',
    hook: useBilibiliHotVideo,
  },
  'bilibili-ranking': {
    title: 'Bilibili (Ranking)',
    hook: useBilibiliRanking,
  },
  'tieba-hot-topic': {
    title: 'Tieba (Hot Topic)',
    hook: useTiebaHotTopic,
  },
  'douyin-hot-search': {
    title: 'Douyin (Hot Search)',
    hook: useDouyinHotSearch,
  },
}

export type TrendingType = keyof typeof trendingServices
