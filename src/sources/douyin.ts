import type { TopicItem } from '../types'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'
import { TagColor } from '../types'

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
      { value: '新', color: TagColor.Magenta },
      { value: '商', color: TagColor.Blue },
      { value: '热', color: TagColor.Red },
      { value: '爆', color: TagColor.Red },
      { value: '首发', color: TagColor.Red },
      {},
      { value: '同城', color: TagColor.Green },
      { value: '独家', color: TagColor.Red },
      { value: '挑战', color: TagColor.Green },
      { value: '当事人', color: TagColor.Red },
      { value: '剧集', color: TagColor.Yellow },
      { value: '电影', color: TagColor.Yellow },
      { value: '综艺', color: TagColor.Yellow },
      {},
      { value: '晚会', color: TagColor.Yellow },
      { value: '辟谣', color: TagColor.Red },
      { value: '热议', color: TagColor.Red },
      {},
      {},
      { value: '解读', color: TagColor.Red },
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
