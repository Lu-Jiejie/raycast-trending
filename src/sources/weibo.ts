import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useWeiboHotSearch() {
  const fetchWeiboHotSearch = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://weibo.com/ajax/side/hotSearch', {
      headers: {
        Referer: 'https://weibo.com/',
        Accept: 'application/json',
      },
    })

    return (data.data.realtime as any[])
      .filter((item) => {
        return item.is_ad !== 1
      })
      .map((item: any): TopicItem => {
        const searchKey = item.word_scheme || `#${item.word}#`
        return {
          type: 'weibo-hot-search',
          id: item.word,
          title: item.word,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(searchKey)}`,
          tag: { value: item.icon_desc, color: item.icon_desc_color },
          description: item.desc,
          extra: {
            hotValue: item.num || 0,
          },
        }
      })
  }

  return useCachedTrending('weibo-hot-search', fetchWeiboHotSearch)
}
