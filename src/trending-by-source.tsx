import type { SourceInfo } from './config/sourceInfo'
import type { SourceOrderItem } from './types'
import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Icon,
  List,
} from '@raycast/api'
import { useEffect, useState } from 'react'
import TrendingMain from './components/Trending'
import { sourceInfo } from './config/sourceInfo'
import Configure from './configure'
import { t } from './logic'
import { getGroupedSourcesForConfig } from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang

export default function TrendingBySource() {
  const [enabledSources, setEnabledSources] = useState<SourceOrderItem[]>([])
  const [disabledSources, setDisabledSources] = useState<SourceOrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSources = async () => {
    setIsLoading(true)
    const groupedSources = await getGroupedSourcesForConfig(lang)
    setEnabledSources(groupedSources.enabled.filter(s => s.enabled))
    setDisabledSources(groupedSources.disabled.filter(s => !s.enabled))
    setIsLoading(false)
  }

  useEffect(() => {
    loadSources()
  }, [])

  // 获取完整的SourceInfo
  const getSourceInfo = (sourceOrderItem: SourceOrderItem): SourceInfo | undefined => {
    return sourceInfo.find(s => s.id === sourceOrderItem.id)
  }

  return (
    <List isLoading={isLoading} navigationTitle={t('Select Source', '选择热点源')}>
      <List.Section title={t('Enabled Sources', '已启用')}>
        {enabledSources.map((source) => {
          const sourceDetail = getSourceInfo(source)
          if (!sourceDetail)
            return null

          return (
            <List.Item
              key={source.id}
              icon={typeof source.icon === 'string'
                ? source.icon
                : { source: { light: source.icon.light, dark: source.icon.dark || source.icon.light } }}
              title={source.title}
              keywords={[sourceDetail.title.en, sourceDetail.title.zh]}
              actions={(
                <ActionPanel>
                  <Action.Push
                    title={t('View Trending Content', '查看热点内容')}
                    target={<TrendingMain defaultSource={sourceDetail.id} />}
                  />
                  <ActionPanel.Section title={t('More', '更多')}>
                    <Action.OpenInBrowser
                      title={t('Open List in Browser', '在浏览器中打开列表')}
                      url={sourceDetail.page}
                    />
                    <Action.OpenInBrowser
                      title={t('Open Homepage in Browser', '在浏览器中打开主页')}
                      url={sourceDetail.homepage}
                    />
                    <Action.Push
                      title={t('Configure Sources', '配置热点源')}
                      icon={Icon.Cog}
                      target={<Configure />}
                      onPop={loadSources}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              )}
            />
          )
        })}
      </List.Section>

      {disabledSources.length > 0 && (
        <List.Section title={t('Disabled Sources', '已禁用')}>
          {disabledSources.map((source) => {
            const sourceDetail = getSourceInfo(source)
            if (!sourceDetail)
              return null

            return (
              <List.Item
                key={source.id}
                icon={typeof source.icon === 'string'
                  ? source.icon
                  : { source: { light: source.icon.light, dark: source.icon.dark || source.icon.light } }}
                title={source.title}
                subtitle={t('Disabled', '已禁用')}
                keywords={[sourceDetail.title.en, sourceDetail.title.zh]}
                actions={(
                  <ActionPanel>
                    <Action.Push
                      title={t('Configure Source', '配置热点源')}
                      icon={Icon.Cog}
                      target={<Configure />}
                      onPop={loadSources}
                    />
                  </ActionPanel>
                )}
              />
            )
          })}
        </List.Section>
      )}
    </List>
  )
}
