import type { TrendingItem } from '../types'
import { load } from 'cheerio'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useHupuHotPost() {
  const fetchHupuHotPost = async (): Promise<TrendingItem[]> => {
    const { data: html } = await axios.get('https://bbs.hupu.com/topic-daily-hot')

    const $ = load(html)
    const result: TrendingItem[] = []

    $('.bbs-sl-web-post-body').each((_, element) => {
      const postLink = $(element).find('a.p-title')
      const path = postLink.attr('href')!
      const title = postLink.text().trim()!
      const [comment, view] = $(element).find('.post-datum').text().split('/').map(i => +i.trim())

      result.push({
        type: 'hupu-hot-post',
        id: path,
        title,
        url: `https://bbs.hupu.com${path}`,
        description: '步行街热帖',
        extra: {
          comment,
          view,
        },
      })
    })

    return result
  }

  return useCachedTrending('hupu-hot-post', fetchHupuHotPost)
}
