import type { TrendingItem } from '../types'
import { load } from 'cheerio'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useGithubTrendingToday() {
  const fetchGithubTrendingToday = async (): Promise<TrendingItem[]> => {
    const { data } = await axios.get('https://github.com/trending?since=daily', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://github.com/',
        'Connection': 'keep-alive',
      },
    })

    const res: TrendingItem[] = []
    const $ = load(data)

    $('.Box article').each((_, element) => {
      const titleAnchor = $(element).find('>h2 a')
      const titleText = titleAnchor.text().trim().replace(/\s+/g, ' ').replace(/\r?\n/g, '').split('/').map(s => s.trim())
      const owner = titleText[0] || ''
      const repo = titleText[1] || ''

      const url = `https://github.com/${owner}/${repo}`
      const description = $(element).find('>p').text().trim()
      const starCount = +$(element).find(`a[href="/${owner}/${repo}/stargazers"]`).text().trim().replace(',', '') || 0
      const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim()
      const languageColor = $(element).find('span.repo-language-color').css('background-color') || 'gray'

      res.push({
        type: 'github-trending-today',
        id: `${owner}/${repo}`,
        title: repo,
        url,
        description,
        extra: {
          starCount,
          owner,
          language,
          languageColor,
        },
      })
    })

    return res
  }

  return useCachedTrending('github-trending-today', fetchGithubTrendingToday)
}
