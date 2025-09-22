import {
  Action,
  ActionPanel,
  getPreferenceValues,
  List,
} from '@raycast/api'
import Trending from './components/Trending'
import { getEnabledSources } from './logic'

const preferences = getPreferenceValues<Preferences>()
const enabledSources = getEnabledSources()
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
  return (
    <List navigationTitle={i18n.selectSource[lang]}>
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
