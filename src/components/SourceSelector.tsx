import {
  Action,
  ActionPanel,
  List,
} from '@raycast/api'
import { settings } from '../logic/settings'
import TrendingTopics from './TrendingTopics'

const lang = settings.lang
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
  const enabledSources = settings.enabledSources

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
