import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useZhihuHotTopic() {
  const fetchZhihuHotTopic = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=30&desktop=true')
    return data.data.map((item: any): TopicItem => {
      const hotValue = Number((item.target.metrics_area.text as string || '').match(/(\d+)/)?.[1] || 0) * 10000 || 0
      return {
        type: 'zhihu-hot-topic',
        id: item.id,
        title: item.target.title_area.text,
        url: item.target.link.url,
        description: item.target.excerpt_area.text,
        extra: {
          hotValue,
        },
      }
    })
  }

  return useCachedTrending('zhihu-hot-topic', fetchZhihuHotTopic)
}
