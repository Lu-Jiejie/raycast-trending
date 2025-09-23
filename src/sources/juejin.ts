import type { TrendingItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useJuejinHotPost() {
  const fetchJuejinHotPost = async (): Promise<TrendingItem[]> => {
    const { data } = await axios.get('https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot')
    return data.data.map((item: any): TrendingItem => {
      return {
        type: 'juejin-hot-post',
        id: item.content.content_id,
        title: item.content.title,
        url: item.content.url,
        extra: {
          author: item.author.name,
          authorAvatar: item.author.avatar,
          view: item.content_counter.view,
          hotValue: item.content_counter.hot_rank,
        },
      }
    })
  }

  return useCachedTrending('juejin-hot-post', fetchJuejinHotPost)
}
