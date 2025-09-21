import {
  Action,
  ActionPanel,
  List,
} from '@raycast/api'
import { settings } from '../logic/settings'
import TrendingTopics from './TrendingTopics'

const lang = settings.lang
const i18n = {
  selectService: {
    en: 'Select Service',
    zh: '选择服务',
  },
  availableServices: {
    en: 'Available Services',
    zh: '可用服务',
  },
  viewTrendingTopics: {
    en: 'View Trending Topics',
    zh: '查看热点',
  },
}

export default function ServiceSelector() {
  const enabledServices = settings.enabledServices

  return (
    <List navigationTitle={i18n.selectService[lang]}>
      <List.Section title={i18n.availableServices[lang]}>
        {enabledServices.map(service => (
          <List.Item
            key={service.id}
            icon={service.icon}
            title={service.title[lang]}
            keywords={[service.title.en, service.title.zh]}
            actions={(
              <ActionPanel>
                <Action.Push
                  title={i18n.viewTrendingTopics[lang]}
                  target={<TrendingTopics defaultService={service.id} />}
                />
              </ActionPanel>
            )}
          />
        ))}
      </List.Section>
    </List>
  )
}
