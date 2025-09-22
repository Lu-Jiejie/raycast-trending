import type { SourceInfo } from './sources'
import {
  Action,
  ActionPanel,
  getPreferenceValues,
  List,
} from '@raycast/api'
import { useEffect, useState } from 'react'
import Trending from './components/Trending'
import { t } from './logic'
import { getOrderedEnabledSources } from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang

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
    <List isLoading={isLoading} navigationTitle={t('Select Source', '选择热点源')}>
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
                title={t('View Trending Content', '查看热点内容')}
                target={<Trending defaultSource={source.id} />}
              />
            </ActionPanel>
          )}
        />
      ))}
    </List>
  )
}
