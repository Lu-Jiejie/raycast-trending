import type { TopicItem } from '../types'
import { load } from 'cheerio'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useDoubanNewMovie() {
  const fetchDoubanNewMovie = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://movie.douban.com/chart')
    const $ = load(data)
    const res: TopicItem[] = []

    $('.article .item').each((_, element) => {
      const titleAnchor = $(element).find('td:nth-child(2) a')
      const title = titleAnchor.text().split(/\//)[0].trim()
      const url = titleAnchor.attr('href')!
      const ratingNum = +$(element).find('td:nth-child(2) .rating_nums').text().trim()
      const ratingPeople = +$(element).find('td:nth-child(2) .pl').text().trim().replace(/\D/g, '')
      const description = $(element).find('td:nth-child(2) p').text().trim().replace(/\s+/g, ' ')

      res.push({
        type: 'douban-new-movie',
        title,
        id: title,
        url,
        description,
        extra: {
          ratingNum,
          ratingPeople,
        },

      })
    })

    return res
  }

  return useCachedTrending('douban-new-movie', fetchDoubanNewMovie)
}
