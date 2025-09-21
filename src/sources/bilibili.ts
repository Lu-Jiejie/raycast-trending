import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'
import { TagColor } from '../types'

export function useBilibiliHotSearch() {
  const fetchBilibiliHotSearch = async () => {
    const { data } = await axios.get('https://s.search.bilibili.com/main/hotword?limit=30')

    const labelMap = {
      4: { value: '新', color: TagColor.Yellow },
      5: { value: '热', color: TagColor.Red },
      7: { value: '直播中', color: TagColor.Yellow },
      9: { value: '梗', color: TagColor.Yellow },
      11: { value: '话题', color: TagColor.Yellow },
      12: { value: '独家', color: TagColor.Yellow },
    }

    return data.list.map((item: any): TopicItem => {
      const tag = labelMap[item.label as keyof typeof labelMap] || {}

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
  return useCachedTrending('bilibili-hot-search', fetchBilibiliHotSearch)
}

export function useBilibiliHotVideo() {
  const fetchBilibiliHotVideo = async () => {
    const { data } = await axios.get('https://api.bilibili.com/x/web-interface/popular')
    return data.data.list.map((item: any): TopicItem => {
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
  return useCachedTrending('bilibili-hot-video', fetchBilibiliHotVideo)
}

export function useBilibiliRanking() {
  const fetchBilibiliRanking = async () => {
    const { data } = await axios.get('https://api.bilibili.com/x/web-interface/ranking/v2')
    return data.data.list.slice(0, 30).map((item: any): TopicItem => {
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
    })
  }
  return useCachedTrending('bilibili-ranking', fetchBilibiliRanking)
}
