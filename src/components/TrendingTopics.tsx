import type { TrendingType } from '../services/definitions'
import type { TopicItem } from '../types'
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Image,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import { useEffect, useMemo, useState } from 'react'
import { useTrending } from '../hooks/useTrending'
import { settings } from '../logic/settings'
import { serviceDefinitions } from '../services/definitions'

const lang = settings.lang
const i18n = {
  refresh: {
    en: 'Refresh',
    zh: '刷新',
  },
  openInBrowser: {
    en: 'Open in Browser',
    zh: '在浏览器中打开',
  },
  openListInBrowser: {
    en: 'Open List in Browser',
    zh: '在浏览器中打开列表',
  },
  openHomepageInBrowser: {
    en: 'Open Homepage in Browser',
    zh: '在浏览器中打开主页',
  },
  lastUpdated: {
    en: 'Last updated',
    zh: '最后更新',
  },
  updating: {
    en: 'Updating...',
    zh: '正在更新...',
  },
  more: {
    en: 'More',
    zh: '更多',
  },
  searchPlaceholder(serviceName: string) {
    return {
      en: `Search in ${serviceName}...`,
      zh: `在 ${serviceName} 中搜索 ...`,
    }
  },
  selectTrendingType: {
    en: 'Select Trending Type',
    zh: '选择热点分类',
  },
  trendingTopics: {
    en: 'Trending Topics',
    zh: '热点',
  },
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp)
    return i18n.updating[lang]

  return `${i18n.lastUpdated[lang]}: ${new Date(timestamp).toLocaleString()}`
}

function getRankIcon(rank: number): Image.ImageLike {
  const num = rank + 1
  if (num > 30)
    return Icon.Dot

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

interface TrendingTopicsProps {
  defaultService?: TrendingType
}

export default function TrendingTopics({ defaultService }: TrendingTopicsProps = {}) {
  const enabledServices = settings.enabledServices
  const primaryService = settings.primaryService || enabledServices[0]?.id
  const [trendingType, setTrendingType] = useState<TrendingType>(defaultService || primaryService || 'zhihu-hot-topic')
  const { data, isLoading, refresh, timestamp, error } = useTrending(trendingType)
  const definition = serviceDefinitions.find(s => s.id === trendingType)
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

      switch (trendingType) {
        case 'bilibili-hot-search':
          accessories = [{
            tag: {
              value: item.extra?.tag,
              color: item.extra?.tag === '热' ? Color.Red : Color.Yellow,
            },
          }]
          break
        case 'bilibili-hot-video':
        case 'bilibili-ranking':
          accessories = [
            { tag: { value: item.extra?.reason, color: Color.Yellow } },
            { icon: { source: item.extra?.ownerFace, mask: Image.Mask.RoundedRectangle }, text: item.extra?.owner },
            { icon: Icon.Play, text: formatCompactNumber(item.extra?.view || 0) },
          ]
          break
        case 'tieba-hot-topic':
          accessories = [
            { icon: Icon.Message, text: formatCompactNumber(item.extra?.discuss || 0) },
          ]
          break
        case 'douyin-hot-search':
          accessories = [
            { tag: {
              value: item.extra?.tag.value,
              color: item.extra?.tag.color,
            } },
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          ]
          break
        case 'weibo-hot-search':
          accessories = [
            { tag: { value: item.extra?.tag?.value, color: item.extra?.tag?.color,
            } },
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          ]
          break
        case 'thepaper-hot-news':
          accessories = [
            { icon: Icon.ThumbsUp, text: formatCompactNumber(item.extra?.praiseCount || 0) },
            // { icon: Icon.SpeechBubbleActive, text: formatCompactNumber(item.extra?.commentCount || 0) },
            { text: formatDate(item.extra?.publishTime) },
          ]
          break
        case 'zhihu-hot-topic':
          accessories = [
            { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
          ]
          break
        case 'toutiao-hot-news':
          accessories = [{
            tag: { value: item.extra?.tag?.value, color: item.extra?.tag?.color },
          }]
          break
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
                title={i18n.openInBrowser[lang]}
              />
              <ActionPanel.Section title={i18n.more[lang]}>
                <Action
                  title={i18n.refresh[lang]}
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
      searchBarPlaceholder={i18n.searchPlaceholder(definition!.title[lang])[lang]}
      actions={(
        <ActionPanel>
          <Action
            title={i18n.refresh[lang]}
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
          tooltip={i18n.selectTrendingType[lang]}
          value={trendingType}
          onChange={value => setTrendingType(value as TrendingType)}
        >
          {enabledServices.map(service => (
            <List.Dropdown.Item key={service.id} title={service.title[lang]} value={service.id} />
          ))}
        </List.Dropdown>
      )}
    >
      <List.Item
        title={title}
        subtitle={formatTimestamp(timestamp)}
        icon={icon}
        key={`${trendingType}-header`}
        actions={(
          <ActionPanel>
            <Action
              title={i18n.refresh[lang]}
              icon={Icon.ArrowClockwise}
              onAction={() => refresh(true)}
              shortcut={{
                macOS: { modifiers: ['cmd'], key: 'r' },
                windows: { modifiers: ['ctrl'], key: 'r' },
              }}
            />
            <ActionPanel.Section title={i18n.more[lang]}>
              <Action.OpenInBrowser
                title={i18n.openListInBrowser[lang]}
                url={definition!.page}
              />
              <Action.OpenInBrowser
                title={i18n.openHomepageInBrowser[lang]}
                url={definition!.homepage}
              />
            </ActionPanel.Section>
          </ActionPanel>
        )}
      />
      <List.Section title={i18n.trendingTopics[lang]}>
        {listItems}
      </List.Section>
    </List>
  )
}
