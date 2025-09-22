import type { SourceInfo, SourceType } from '../sources'
import type { TopicItem } from '../types'
import {
  Action,
  ActionPanel,
  Color,
  getPreferenceValues,
  Icon,
  Image,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import { useEffect, useMemo, useState } from 'react'
import Configure from '../configure'
import { useTrending } from '../hooks/useTrendingById'
import { t } from '../logic'
import { getOrderedEnabledSources } from '../logic/source'
import { sourceInfo } from '../sources'
import { TagColor } from '../types'

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

function formatCompactNumber(number: number) {
  // if (number < 1000)
  //   return number.toString()
  // if (number < 10000)
  //   return `${(number / 1000).toFixed(1)}K`
  // return `${(number / 1000000).toFixed(1)}M`
  const langCode = lang === 'en' ? 'en-US' : 'zh-CN'
  const res = new Intl.NumberFormat(langCode, { notation: 'compact' }).format(number)
  return res
}

function formatDate(date: string | number) {
  const d = new Date(date)
  // to YYYY-MM-DD HH:mm
  return d.toISOString().replace('T', ' ').slice(0, 16)
}

export default function Trending({
  defaultSource,
}: {
  defaultSource?: SourceType
} = {}) {
  const [enabledSources, setEnabledSources] = useState<SourceInfo[]>([])
  const [trendingType, setSourceType] = useState<SourceType>(defaultSource || enabledSources[0]?.id)

  useEffect(() => {
    async function loadOrderedSources() {
      const orderedSources = await getOrderedEnabledSources()
      setEnabledSources(orderedSources)

      if (!defaultSource && orderedSources.length > 0) {
        setSourceType(orderedSources[0].id)
      }
    }

    loadOrderedSources()
  }, [])
  const { data, isLoading, refresh, timestamp, error } = useTrending(trendingType)
  const definition = sourceInfo.find(s => s.id === trendingType)
  const title = definition!.title[lang]
  const icon = definition!.icon

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Error',
        message: error.message,
      })
    }
  }, [error])

  const listItems = useMemo(() => {
    return data?.map((item: TopicItem, index: number) => {
      let subtitle: string | undefined

      let accessories: List.Item.Accessory[] = []

      // show tag by default
      if (item?.tag && item.tag?.value) {
        accessories.push({ tag: { value: item.tag.value, color: item.tag.color || TagColor.Yellow } })
      }

      switch (trendingType) {
        case 'bilibili-hot-video':
        case 'bilibili-ranking':
          accessories.push(
            { icon: { source: item.extra?.ownerFace, mask: Image.Mask.RoundedRectangle }, text: item.extra?.owner },
            { icon: Icon.Play, text: formatCompactNumber(item.extra?.view || 0) },
          )
          break
        case 'tieba-hot-topic':
          accessories.push(
            { icon: Icon.Message, text: formatCompactNumber(item.extra?.discuss || 0) },
          )
          break
        case 'douyin-hot-search':
          accessories.push(
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          )
          break
        case 'weibo-hot-search':
          accessories.push(
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          )
          break
        case 'thepaper-hot-news':
          accessories.push(
            { icon: Icon.ThumbsUp, text: formatCompactNumber(item.extra?.praiseCount || 0) },
            // { icon: Icon.SpeechBubbleActive, text: formatCompactNumber(item.extra?.commentCount || 0) },
            { text: formatDate(item.extra?.publishTime) },
          )
          break
        case 'zhihu-hot-topic':
          accessories.push(
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          )
          break
        case 'juejin-hot-post':
          accessories.push(
            { icon: { source: item.extra?.authorAvatar, mask: Image.Mask.RoundedRectangle }, text: item.extra?.author },
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          )
          break
        case 'github-trending-today':
          subtitle = item.extra?.owner
          accessories = [
            { icon: item.tag ? { source: Icon.CircleFilled, tintColor: item.tag?.color } : undefined, text: item.tag?.value },
            { icon: Icon.Star, text: formatCompactNumber(item.extra?.starCount) },
          ]
      }

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
              <Action.Push
                title={t('Configure Sources', '配置热点源')}
                icon={Icon.Cog}
                target={<Configure />}
                shortcut={{ modifiers: ['cmd'], key: 'o' }}
              />
              <Action.OpenInBrowser
                title={t('Open List in Browser', '在浏览器中打开列表')}
                url={definition!.page}
              />
              <Action.OpenInBrowser
                title={t('Open Homepage in Browser', '在浏览器中打开主页')}
                url={definition!.homepage}
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
