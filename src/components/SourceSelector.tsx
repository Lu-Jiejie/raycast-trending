import {
  Action,
  ActionPanel,
  getPreferenceValues,
  List,
} from '@raycast/api'
import { getEnabledSources } from '../logic'
import TrendingTopics from './TrendingTopics'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'
const i18n = {
  selectSource: {
    en: 'Select Source',
    zh: '选择热点源',
  },
  viewTrendingTopics: {
    en: 'View Trending Topics',
    zh: '查看热点',
  },
}

export default function SourceSelector() {
  const enabledSources = getEnabledSources()

  return (
    <List navigationTitle={i18n.selectSource[lang]}>
      {enabledSources.map(source => (
        <List.Item
          key={source.id}
          icon={source.icon}
          title={source.title[lang]}
          keywords={[source.title.en, source.title.zh]}
          actions={(
            <ActionPanel>
              <Action.Push
                title={i18n.viewTrendingTopics[lang]}
                target={<TrendingTopics defaultSource={source.id} />}
              />
            </ActionPanel>
          )}
        />
      ))}
    </List>
  )
}
