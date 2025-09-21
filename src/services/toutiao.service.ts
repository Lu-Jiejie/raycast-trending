import type { TopicItem } from '../types'
import { Color } from '@raycast/api'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

const labelMap: Record<string, {
  value: string
  color: string
}> = {
  热门事件: { value: '热', color: Color.Red },
  新事件上榜: { value: '新', color: Color.Orange },
  辟谣: { value: '辟谣', color: Color.Blue },
  新进展: { value: '新进展', color: Color.Red },
  解读: { value: '解读', color: Color.Blue },
  现场: { value: '现场', color: Color.Blue },
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
          tag: labelMap[item.LabelDesc] || { value: item.LabelDesc, color: Color.Blue },
        },
      }
    })
  }

  return useCachedTrending('toutiao-hot-news', fetchToutiaoHotNews)
}
