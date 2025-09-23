import type { Image } from '@raycast/api'
import type { SourceInfo, SourceType } from '../config/sourceInfo'
import type { TopicItem } from '../types'
import { Action, ActionPanel, Color, getPreferenceValues, Icon, List, showToast, Toast } from '@raycast/api'
import { useEffect, useMemo } from 'react'
import { sourceInfo } from '../config/sourceInfo'
import { getFullAccessories, getItemSubtitle } from '../config/trendingItem'
import Configure from '../configure'
import { useTrending } from '../hooks/useTrendingById'
import { t } from '../logic'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'

function formatTimestamp(timestamp: number): string {
  if (!timestamp)
    return t('Updating...', '正在更新...')

  return `${t('Last updated', '最后更新')}: ${new Date(timestamp).toLocaleString()}`
}

function getSearchPlaceholder(sourceName: string): string {
  return t(`Search in ${sourceName}...`, `在 ${sourceName} 中搜索 ...`)
}

function getRankIcon(rank: number): Image.ImageLike {
  const num = rank + 1

  const iconName = `Number${String(num).padStart(2, '0')}` as keyof typeof Icon
  return {
    source: Icon[iconName],
    tintColor: rank === 0 ? Color.Red : rank < 3 ? Color.Orange : rank < 5 ? Color.Yellow : Color.SecondaryText,
  }
}

export default function TrendingChild({
  trendingType,
  enabledSources,
  setSourceType,
}: {
  trendingType: SourceType
  enabledSources: SourceInfo[]
  setSourceType: (sourceType: SourceType) => void
}) {
  const { data, isLoading, refresh, timestamp, error } = useTrending(trendingType)

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Error',
        message: error.message,
      })
    }
  }, [error])

  const definition = sourceInfo.find(s => s.id === trendingType)

  if (!definition) {
    return <List isLoading />
  }

  const title = definition.title[lang]
  const icon = definition.icon

  const listItems = useMemo(() => {
    return data?.map((item: TopicItem, index: number) => {
      const subtitle = getItemSubtitle(item, trendingType)
      const accessories = getFullAccessories(item, trendingType)

      return (
        <List.Item
          key={`${trendingType}-${item.id}`}
          icon={getRankIcon(index)}
          title={item.title}
          subtitle={subtitle}
          accessories={accessories}
          actions={(
            <ActionPanel>
              <Action.OpenInBrowser
                url={item.url}
                title={t('Open in Browser', '在浏览器中打开')}
              />
              <ActionPanel.Section title={t('More', '更多')}>
                <Action
                  title={t('Refresh', '刷新')}
                  icon={Icon.ArrowClockwise}
                  onAction={() => {
                    refresh(true)
                  }}
                  shortcut={{
                    macOS: { modifiers: ['cmd'], key: 'r' },
                    windows: { modifiers: ['ctrl'], key: 'r' },
                  }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          )}
        />
      )
    })
  }, [data, trendingType, refresh])

  return (
    <List
      isLoading={isLoading}
      navigationTitle={title}
      searchBarPlaceholder={getSearchPlaceholder(definition!.title[lang])}
      actions={(
        <ActionPanel>
          <Action
            title={t('Refresh', '刷新')}
            icon={Icon.ArrowClockwise}
            onAction={() => refresh(true)}
            shortcut={{
              macOS: { modifiers: ['cmd'], key: 'r' },
              windows: { modifiers: ['ctrl'], key: 'r' },
            }}
          />
        </ActionPanel>
      )}
      searchBarAccessory={(
        <List.Dropdown
          tooltip={t('Select Source', '选择热点源')}
          value={trendingType}
          onChange={value => setSourceType(value as SourceType)}
        >
          {enabledSources.map(source => (
            <List.Dropdown.Item key={source.id} title={source.title[lang]} value={source.id} />
          ))}
        </List.Dropdown>
      )}
    >
      <List.Item
        title={title}
        subtitle={formatTimestamp(timestamp)}
        icon={typeof icon === 'string'
          ? icon
          : { source: { light: icon.light, dark: icon.dark || icon.light } }}
        key={`${trendingType}-header`}
        actions={(
          <ActionPanel>
            <Action
              title={t('Refresh', '刷新')}
              icon={Icon.ArrowClockwise}
              onAction={() => refresh(true)}
              shortcut={{
                macOS: { modifiers: ['cmd'], key: 'r' },
                windows: { modifiers: ['ctrl'], key: 'r' },
              }}
            />
            <ActionPanel.Section title={t('More', '更多')}>
              <Action.OpenInBrowser
                title={t('Open List in Browser', '在浏览器中打开列表')}
                url={definition!.page}
              />
              <Action.OpenInBrowser
                title={t('Open Homepage in Browser', '在浏览器中打开主页')}
                url={definition!.homepage}
              />
              <Action.Push
                title={t('Configure Sources', '配置热点源')}
                icon={Icon.Cog}
                target={<Configure />}
              />
            </ActionPanel.Section>
          </ActionPanel>
        )}
      />
      <List.Section title={t('Trending Content', '热点内容')}>
        {listItems}
      </List.Section>
    </List>
  )
}
