import type { TopicItem } from '../types'
import { Color } from '@raycast/api'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useWeiboHotSearch() {
  const fetchWeiboHotSearch = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://m.weibo.cn/api/container/getIndex?containerid=106003%26filter_type%3Drealtimehot', {
      headers: {
        'referer': 'https://s.weibo.com/top/summary?cate=realtimehot',
        'x-requested-with': 'XMLHttpRequest',
      },
    })
    const tagMap = {
      1: { value: '新', color: Color.Red },
      2: { value: '热', color: Color.Yellow },
      4: { value: '爆', color: Color.Red },
      16: { value: '沸', color: Color.Orange },
    }

    return (data.data.cards[0].card_group as any[])
      .filter((item, index) => {
        return index !== 0
          && !(item.actionlog.ext as string).includes('ads_word')
          && item.desc
      })
      .map((item: any): TopicItem => {
        const tagType = +((item.icon as string || '').match(/moter\/flags\/(\d+)_\d+\.png/)?.[1] || '0')
        const tag = tagMap[tagType as keyof typeof tagMap] || {}
        return {
          type: 'weibo-hot-search',
          id: item.desc,
          title: item.desc,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(`#${item.desc}#`)}`,
          description: item.desc,
          extra: {
            tag,
            hotValue: item.desc_extr,
          },
        }
      })
  }

  return useCachedTrending('weibo-hot-search', fetchWeiboHotSearch, 1000 * 60 * 5)
}
