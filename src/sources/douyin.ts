import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useDouyinHotSearch() {
  const fetchDouyinHotSearch = async () => {
    const cookie = (await axios.get('https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383')).headers['set-cookie']?.join('; ')

    const { data } = await axios.get('https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1', {
      headers: {
        Cookie: cookie,
      },
    })
    const labelMap = {
      1: { value: '新', color: '#D300B2' },
      2: { value: '商', color: '#168EF9' },
      3: { value: '热', color: '#FE2C55' },
      4: { value: '爆', color: '#A80F0F' },
      5: { value: '首发', color: '#FE2C55' },
      7: { value: '同城', color: '#04B200' },
      8: { value: '独家', color: '#FE2C55' },
      9: { value: '挑战', color: '#04B200' },
      10: { value: '当事人', color: '#FE2C55' },
      11: { value: '剧集', color: 'gray' },
      12: { value: '电影', color: 'gray' },
      13: { value: '综艺', color: 'gray' },
      15: { value: '晚会', color: 'gray' },
      16: { value: '辟谣', color: '#FE2C55' },
      17: { value: '热议', color: '#FE2C55' },
      20: { value: '解读', color: '#FE2C55' },
    }

    return data.data.word_list.map((item: any): TopicItem => {
      const tag = labelMap[item.label as keyof typeof labelMap] || {}

      return {
        type: 'douyin-hot-search',
        id: item.sentence_id,
        title: item.word,
        url: `https://www.douyin.com/hot/${item.sentence_id}`,
        tag,
        extra: {
          hotValue: item.hot_value,
        },
      }
    })
  }
  return useCachedTrending('douyin-hot-search', fetchDouyinHotSearch)
}
