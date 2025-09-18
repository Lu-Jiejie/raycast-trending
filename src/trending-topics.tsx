import type { TrendingType } from './services'
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Image,
  List,
} from '@raycast/api'
import { useMemo, useState } from 'react'
import { useTrending } from './hooks/useTrending'
import { getEnabledServices } from './logic/settings'
import { serviceDefinitions } from './services'

function formatTimestamp(timestamp: number): string {
  if (!timestamp)
    return 'Updating...'

  return `Last updated: ${new Date(timestamp).toLocaleString()}`
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
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(number)
}

export default function Command() {
  const enabledServices = getEnabledServices()
  const [trendingType, setTrendingType] = useState<TrendingType>(enabledServices[0].id)
  const { data, isLoading, refresh, timestamp } = useTrending(trendingType)

  const listItems = useMemo(() => {
    return data?.map((item, index) => {
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
      }

      return (
        <List.Item
          key={item.id}
          icon={getRankIcon(index)}
          title={item.title}
          subtitle={subtitle}
          accessories={accessories}
          actions={(
            <ActionPanel>
              <Action.OpenInBrowser url={item.url} />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={() => {
                  refresh(true)
                }}
              />
            </ActionPanel>
          )}
        />
      )
    })
  }, [data, trendingType, refresh])

  return (
    <List
      isLoading={isLoading}
      navigationTitle={serviceDefinitions.find(s => s.id === trendingType)?.title}
      searchBarPlaceholder={formatTimestamp(timestamp)}
      actions={(
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={() => refresh(true)}
          />
        </ActionPanel>
      )}
      searchBarAccessory={(
        <List.Dropdown
          tooltip="Select Trending Type"
          value={trendingType}
          onChange={value => setTrendingType(value as TrendingType)}
        >
          {enabledServices.map(service => (
            <List.Dropdown.Item key={service.id} title={service.title} value={service.id} />
          ))}
        </List.Dropdown>
      )}
    >
      {listItems}
    </List>
  )
}
