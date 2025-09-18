import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useBilibiliHotSearch() {
  const fetchBilibiliHotSearch = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://s.search.bilibili.com/main/hotword?limit=30')
    return data.list.map((item: any) => {
      let tag: string | undefined
      switch (item.word_type) {
        case 4: tag = '新'
          break
        case 5: tag = '热'
          break
        case 7: tag = '直播中'
          break
        case 9: tag = '梗'
          break
        case 11: tag = '话题'
          break
        case 12: tag = '独家'
          break
        default: tag = undefined
      }
      return {
        type: 'bilibili-hot-search',
        id: item.hot_id.toString(),
        title: item.show_name,
        url: `https://www.bilibili.com/v/popular/all?keyword=${encodeURIComponent(item.keyword)}`,
        description: item.keyword,
        extra: { tag },
      }
    })
  }
  return useCachedTrending<TopicItem[]>('bilibili-hot-search', fetchBilibiliHotSearch, 1000 * 60 * 5)
}

export function useBilibiliHotVideo() {
  const fetchBilibiliHotVideo = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://api.bilibili.com/x/web-interface/popular')
    return data.data.list.map((item: any) => {
      return {
        type: 'bilibili-hot-video',
        id: item.bvid,
        title: item.title,
        url: `https://www.bilibili.com/video/${item.bvid}`,
        description: item.desc,
        extra: {
          owner: item.owner.name,
          ownerFace: item.owner.face,
          view: item.stat.view,
          like: item.stat.like,
          coin: item.stat.coin,
          danmaku: item.stat.danmaku,
          favorite: item.stat.favorite,
          reason: item.rcmd_reason.content || undefined,
        },
      }
    })
  }
  return useCachedTrending<TopicItem[]>('bilibili-hot-video', fetchBilibiliHotVideo)
}

export function useBilibiliRanking() {
  const fetchBilibiliRanking = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://api.bilibili.com/x/web-interface/ranking/v2')
    console.log(data.data.list.length)
    return data.data.list.map((item: any) => {
      return {
        type: 'bilibili-ranking',
        id: item.bvid,
        title: item.title,
        url: `https://www.bilibili.com/video/${item.bvid}`,
        description: item.desc,
        extra: {
          owner: item.owner.name,
          ownerFace: item.owner.face,
          view: item.stat.view,
          like: item.stat.like,
          coin: item.stat.coin,
          danmaku: item.stat.danmaku,
          favorite: item.stat.favorite,
        },
      }
    }).slice(0, 30)
  }
  return useCachedTrending<TopicItem[]>('bilibili-ranking', fetchBilibiliRanking)
}
