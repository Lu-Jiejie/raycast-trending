import type { TrendingItem } from '../types'
import { load } from 'cheerio'
import { decode } from 'iconv-lite'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function use52PojieHotPost() {
  const fetch52PojieHotPost = async (): Promise<TrendingItem[]> => {
    const { data } = await axios.get('https://www.52pojie.cn/forum.php?mod=guide&view=hot', {
      responseType: 'arraybuffer',
    })
    const html = decode(data, 'gbk')
    const res: TrendingItem[] = []
    const $ = load(html)

    $('.bm_c table tbody').each((_, element) => {
      const id = $(element).attr('id')!.replace('normalthread_', '')
      const title = $(element).find('.common .xst').text().trim()
      console.log(title)
      res.push({
        type: '52pojie-hot-post',
        title,
        id,
        url: `https://www.52pojie.cn/thread-${id}-1-1.html`,
      })
    })

    return res
  }

  return useCachedTrending('52pojie-hot-post', fetch52PojieHotPost)
}
