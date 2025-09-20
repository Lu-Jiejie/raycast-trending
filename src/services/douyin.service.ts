import type { TopicItem } from '../types'
import { Color } from '@raycast/api'
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
    const labelMap = [
      {},
      { value: '新', color: Color.Magenta },
      { value: '商', color: Color.Blue },
      { value: '热', color: Color.Red },
      { value: '爆', color: Color.Red },
      { value: '首发', color: Color.Red },
      {},
      { value: '同城', color: Color.Green },
      { value: '独家', color: Color.Red },
      { value: '挑战', color: Color.Green },
      { value: '当事人', color: Color.Red },
      { value: '剧集', color: Color.Yellow },
      { value: '电影', color: Color.Yellow },
      { value: '综艺', color: Color.Yellow },
      {},
      { value: '晚会', color: Color.Yellow },
      { value: '辟谣', color: Color.Red },
      { value: '热议', color: Color.Red },
      {},
      {},
      { value: '解读', color: Color.Red },
    ]
    return data.data.word_list.slice(0, 30).map((item: any): TopicItem => {
      const tag = labelMap[item.label]

      return {
        type: 'douyin-hot-search',
        id: item.sentence_id,
        title: item.word,
        url: `https://www.douyin.com/hot/${item.sentence_id}`,
        extra: {
          hotValue: item.hot_value,
          tag,
        },
      }
    })
  }
  return useCachedTrending('douyin-hot-search', fetchDouyinHotSearch)
}
