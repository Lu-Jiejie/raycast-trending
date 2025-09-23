import type { TrendingItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useTiebaHotTopic() {
  const fetchTiebaHotTopic = async (): Promise<TrendingItem[]> => {
    const { data } = await axios.get('https://tieba.baidu.com/hottopic/browse/topicList')
    return data.data.bang_topic.topic_list.map((item: any): TrendingItem => {
      return {
        type: 'tieba-hot-topic',
        id: item.topic_id,
        title: item.topic_name,
        url: item.topic_url,
        description: item.topic_desc,
        extra: {
          discuss: item.discuss_num,
        },
      }
    })
  }

  return useCachedTrending('tieba-hot-topic', fetchTiebaHotTopic)
}
