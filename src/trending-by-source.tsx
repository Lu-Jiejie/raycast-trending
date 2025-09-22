import type { SourceInfo } from './sources'
import {
  Action,
  ActionPanel,
  getPreferenceValues,
  List,
} from '@raycast/api'
import { useEffect, useState } from 'react'
import Trending from './components/Trending'
import { getOrderedEnabledSources } from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang
const i18n = {
  selectSource: {
    en: 'Select Source',
    zh: '选择热点源',
  },
  viewTrendingContent: {
    en: 'View Trending Content',
    zh: '查看热点内容',
  },
}

export default function TrendingBySource() {
  const [enabledSources, setEnabledSources] = useState<SourceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSources() {
      const sources = await getOrderedEnabledSources()
      setEnabledSources(sources)
      setIsLoading(false)
    }
    loadSources()
  }, [])

  return (
    <List isLoading={isLoading} navigationTitle={i18n.selectSource[lang]}>
      {enabledSources.map(source => (
        <List.Item
          key={source.id}
          icon={typeof source.icon === 'string'
            ? source.icon
            : { source: { light: source.icon.light, dark: source.icon.dark || source.icon.light } }}
          title={source.title[lang]}
          keywords={[source.title.en, source.title.zh]}
          actions={(
            <ActionPanel>
              <Action.Push
                title={i18n.viewTrendingContent[lang]}
                target={<Trending defaultSource={source.id} />}
              />
            </ActionPanel>
          )}
        />
      ))}
    </List>
  )
}
