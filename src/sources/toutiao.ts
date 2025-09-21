import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

const labelMap: Record<string, {
  value: string
  color: string
}> = {
  热门事件: { value: '热', color: '#F04243' },
  新事件上榜: { value: '新', color: '#FF782D' },
  辟谣: { value: '辟谣', color: '#1A74FF' },
  新进展: { value: '新进展', color: '#1A74FF' },
  解读: { value: '解读', color: '#1A74FF' },
  现场: { value: '现场', color: '#1A74FF' },
}

export function useToutiaoHotNews() {
  const fetchToutiaoHotNews = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc')
    return data.data.map((item: any): TopicItem => {
      return {
        type: 'toutiao-hot-news',
        id: item.ClusterIdStr,
        title: item.Title,
        url: `https://www.toutiao.com/trending/${item.ClusterIdStr}`,
        description: item.topic_desc,
        tag: labelMap[item.LabelDesc] || { value: item.LabelDesc, color: '#1A74FF' },
      }
    })
  }

  return useCachedTrending('toutiao-hot-news', fetchToutiaoHotNews)
}
