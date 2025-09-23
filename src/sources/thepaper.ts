import type { TrendingItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useThepaperHotNews() {
  const fetchThepaperHotNews = async (): Promise<TrendingItem[]> => {
    const { data } = await axios.get('https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar')
    return data.data.hotNews.map((item: any): TrendingItem => {
      return {
        type: 'thepaper-hot-news',
        id: item.contId,
        title: item.name,
        url: `https://www.thepaper.cn/newsDetail_forward_${item.contId}`,
        extra: {
          praiseCount: item.praiseTimes,
          commentCount: +item.interactionNum,
          publishTime: item.pubTimeLong,
        },
      }
    })
  }

  return useCachedTrending('thepaper-hot-news', fetchThepaperHotNews)
}
