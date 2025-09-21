import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'
import { TagColor } from '../types'

const labelMap: Record<string, {
  value: string
  color: string
}> = {
  热门事件: { value: '热', color: TagColor.Red },
  新事件上榜: { value: '新', color: TagColor.Orange },
  辟谣: { value: '辟谣', color: TagColor.Blue },
  新进展: { value: '新进展', color: TagColor.Red },
  解读: { value: '解读', color: TagColor.Blue },
  现场: { value: '现场', color: TagColor.Blue },
}

export function useToutiaoHotNews() {
  const fetchToutiaoHotNews = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc')
    return data.data.slice(0, 30).map((item: any): TopicItem => {
      return {
        type: 'toutiao-hot-news',
        id: item.ClusterIdStr,
        title: item.Title,
        url: `https://www.toutiao.com/trending/${item.ClusterIdStr}`,
        description: item.topic_desc,
        extra: {
          tag: labelMap[item.LabelDesc] || { value: item.LabelDesc, color: TagColor.Blue },
        },
      }
    })
  }

  return useCachedTrending('toutiao-hot-news', fetchToutiaoHotNews)
}
