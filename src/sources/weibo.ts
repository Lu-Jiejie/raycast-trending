import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'
import { TagColor } from '../types'

export function useWeiboHotSearch() {
  const fetchWeiboHotSearch = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583', {
      headers: {
        'referer': 'https://s.weibo.com/top/summary?cate=realtimehot',
        'x-requested-with': 'XMLHttpRequest',
      },
    })
    const tagMap = {
      1: { value: '新', color: TagColor.Red },
      2: { value: '热', color: TagColor.Yellow },
      4: { value: '爆', color: TagColor.Red },
      16: { value: '沸', color: TagColor.Orange },
    }

    return (data.data.cards[0].card_group as any[])
      .filter((item, index) => {
        return index !== 0
          && !(item.actionlog.ext as string).includes('ads_word')
          && item.desc
      })
      .slice(0, 30)
      .map((item: any): TopicItem => {
        const tagType = +((item.icon as string || '').match(/moter\/flags\/(\d+)_\d+\.png/)?.[1] || '0')
        const tag = tagMap[tagType as keyof typeof tagMap] || {}
        // item.desc_extr: "剧集 155144"
        const hotValue = (`${item.desc_extr}` as string || '').match(/(\d+)/)?.[1] || 0
        // console.log(item.desc_extr, hotValue)
        return {
          type: 'weibo-hot-search',
          id: item.desc,
          title: item.desc,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(`#${item.desc}#`)}`,
          description: item.desc,
          extra: {
            tag,
            hotValue,
          },
        }
      })
  }

  return useCachedTrending('weibo-hot-search', fetchWeiboHotSearch)
}
