import type { TopicItem } from '../types'
import * as cheerio from 'cheerio'
import { useCachedTrending } from '../hooks/useCachedTrending'
import axios from '../logic/axios'

export function useGithubTrendingToday() {
  const fetchGithubTrendingToday = async (): Promise<TopicItem[]> => {
    const { data } = await axios.get('https://github.com/trending?since=daily', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://github.com/',
        'Connection': 'keep-alive',
      },
    })

    const res: TopicItem[] = []
    const $ = cheerio.load(data)

    $('.Box article').each((_, element) => {
      const titleAnchor = $(element).find('>h2 a')
      const titleText = titleAnchor.text().trim().replace(/\s+/g, ' ').replace(/\r?\n/g, '').split('/').map(s => s.trim())
      const owner = titleText[0] || ''
      const repo = titleText[1] || ''

      const url = `https://github.com/${owner}/${repo}`
      const description = $(element).find('>p').text().trim()
      const starCount = +$(element).find(`a[href="/${owner}/${repo}/stargazers"]`).text().trim().replace(',', '') || 0
      console.log(`${titleAnchor.attr('href')}/stargazers`)
      const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim()
      const languageColor = $(element).find('span.repo-language-color').css('background-color') || 'gray'

      res.push({
        type: 'github-trending-today',
        id: `${owner}/${repo}`,
        title: repo,
        url,
        description,
        tag: language ? { value: language, color: languageColor } : undefined,
        extra: {
          starCount,
          owner,
        },
      })
    })

    return res
  }

  return useCachedTrending('github-trending-today', fetchGithubTrendingToday)
}

export const PROGRAMMING_LANGUAGES_COLORS = {
  'JavaScript': '#F7DF1E',
  'Python': '#3776AB',
  'Java': '#007396',
  'TypeScript': '#3178C6',
  'C++': '#00599C',
  'Go': '#00ADD8',
  'Ruby': '#CC342D',
  'PHP': '#777BB4',
  'Swift': '#FA7343',
  'Kotlin': '#F18E33',
  'C#': '#5C2D91',
  'Rust': '#000000',
  'Objective-C': '#438EFF',
  'Scala': '#DC3220',
  'Dart': '#00B4AB',
  'Haskell': '#5E5086',
  'Perl': '#39457E',
  'Lua': '#000080',
  'Shell': '#89E051',
  'Markdown': '#083FA1',
  'C': '#555555',
  'Marko': '#42bff2',
  'EJS': '#A91E50',
  'Elm': '#60B5CC',
  'Nim': '#ffc200',
  'Nix': '#7e7eff',
  'OCaml': '#3be133',
  'Makefile': '#427819',
  'R': '#198CE7',
  'Vue': '#4fc08d',
  'CoffeeScript': '#244776',
  'Clojure': '#db5855',
  'Elixir': '#6e4a7e',
  'Erlang': '#B83998',
  'F#': '#b845fc',
  'Groovy': '#e69f56',
  'Julia': '#a270ba',
  'Pascal': '#b0ce4e',
  'Racket': '#22228f',
  'ReScript': '#ed5051',
  'Reason': '#ff5847',
  'Jupyter Notebook': '#DA5B0B',
  'TeX': '#3D6117',
  'Vim script': '#199f4b',
  'Visual Basic': '#945db7',
  'Less': '#A1D9A6',
  'Sass': '#CF649A',
  'SCSS': '#C6538C',
  'Stylus': '#ff6347',
  'YAML': '#cb171e',
  'JSON': '#cb171e',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'PostCSS': '#dc3a0c',
  'PowerShell': '#012456',
  'Dockerfile': '#384d54',
  'Zig': '#ec915c',
  'Vim Script': '#199f4b',
}
