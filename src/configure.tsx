import type { SourceOrderItem } from './types'
import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  getPreferenceValues,
  Icon,
  List,
  showToast,
  Toast,
} from '@raycast/api'
import { useEffect, useState } from 'react'
import { t } from './logic'
import {
  getGroupedSourcesForConfig,
  resetToDefaultState,
  saveSourceConfig,

  toggleSourceInGroup,
} from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'

// 简化图标处理
function getIconSource(icon: string | { light: string, dark?: string }) {
  return typeof icon === 'string' ? icon : { source: { light: icon.light, dark: icon.dark || icon.light } }
}

export default function Configure() {
  const [groupedSources, setGroupedSources] = useState<{
    enabled: SourceOrderItem[]
    disabled: SourceOrderItem[]
  }>({ enabled: [], disabled: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSources() {
      const grouped = await getGroupedSourcesForConfig(lang)
      setGroupedSources(grouped)
      setIsLoading(false)
    }

    loadSources()
  }, [])

  // 简化状态更新逻辑
  const moveSource = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= groupedSources.enabled.length)
      return

    const newEnabled = [...groupedSources.enabled]
    const [movedSource] = newEnabled.splice(fromIndex, 1)
    newEnabled.splice(toIndex, 0, movedSource)

    setGroupedSources(prev => ({ ...prev, enabled: newEnabled }))
  }

  const toggleSource = (sourceId: string) => {
    const newGroupedSources = toggleSourceInGroup(sourceId, groupedSources)
    setGroupedSources(newGroupedSources)
  }

  const saveOrder = async () => {
    const { enabled, disabled } = groupedSources
    const allSources = [...enabled, ...disabled]
    const order = allSources.map(s => s.id)
    const enabledSourceIds = allSources.filter(s => s.enabled).map(s => s.id)

    await saveSourceConfig(order, enabledSourceIds)

    showToast({
      style: Toast.Style.Success,
      title: t('Source order saved!', '热点源排序已保存！'),
    })
  }

  const resetToDefault = async () => {
    const confirmed = await confirmAlert({
      title: t('Confirm Reset', '确认重置'),
      message: t('Are you sure you want to reset all sources to default alphabetical order and enable all sources? This action cannot be undone.', '确定要将所有热点源重置为默认的首字母排序并启用所有源吗？此操作无法撤销。'),
      primaryAction: {
        title: t('Reset', '重置'),
        style: Alert.ActionStyle.Destructive,
      },
      dismissAction: {
        title: t('Cancel', '取消'),
        style: Alert.ActionStyle.Cancel,
      },
    })

    if (!confirmed)
      return

    await resetToDefaultState()

    const grouped = await getGroupedSourcesForConfig(lang)
    setGroupedSources(grouped)

    showToast({
      style: Toast.Style.Success,
      title: t('Reset to default order', '已恢复默认排序'),
    })
  }

  // 提取重复的ActionPanel组件
  const CommonActions = () => (
    <>
      <Action
        title={t('Save Order', '保存排序')}
        icon={Icon.SaveDocument}
        onAction={saveOrder}
        shortcut={{ macOS: { modifiers: ['cmd'], key: 's' }, windows: { modifiers: ['ctrl'], key: 's' } }}
      />
      <Action
        title={t('Reset to Default', '恢复默认')}
        icon={Icon.ArrowCounterClockwise}
        onAction={resetToDefault}
        shortcut={{ macOS: { modifiers: ['cmd'], key: 'r' }, windows: { modifiers: ['ctrl'], key: 'r' } }}
      />
    </>
  )

  // 合并重复的List.Item逻辑
  const SourceItem = ({
    source,
    index,
    showMoveActions = false,
  }: {
    source: SourceOrderItem
    index?: number
    showMoveActions?: boolean
  }) => {
    // 减少嵌套的三元运算符
    const isEnabled = source.enabled
    const statusIcon = isEnabled ? Icon.CheckCircle : Icon.XMarkCircle
    const statusText = isEnabled ? t('Enabled', '已启用') : t('Disabled', '已禁用')
    const toggleIcon = isEnabled ? Icon.EyeSlash : Icon.Eye
    const iconSource = getIconSource(source.icon)

    return (
      <List.Item
        key={source.id}
        title={source.title}
        subtitle={statusText}
        icon={iconSource}
        accessories={[
          { icon: statusIcon, tooltip: statusText },
          ...(index !== undefined ? [{ text: `#${index + 1}` }] : []),
        ]}
        actions={(
          <ActionPanel>
            <Action
              title={t('Toggle Source', '切换热点源')}
              icon={toggleIcon}
              onAction={() => toggleSource(source.id)}
            />
            {showMoveActions && index !== undefined && (
              <>
                <Action
                  title={t('Move Up', '上移')}
                  icon={Icon.ArrowUp}
                  onAction={() => moveSource(index, index - 1)}
                  shortcut={{ windows: { modifiers: ['shift'], key: 'arrowUp' }, macOS: { modifiers: ['shift'], key: 'arrowUp' } }}
                />
                <Action
                  title={t('Move Down', '下移')}
                  icon={Icon.ArrowDown}
                  onAction={() => moveSource(index, index + 1)}
                  shortcut={{ windows: { modifiers: ['shift'], key: 'arrowDown' }, macOS: { modifiers: ['shift'], key: 'arrowDown' } }}
                />
              </>
            )}
            <ActionPanel.Section>
              <CommonActions />
            </ActionPanel.Section>
          </ActionPanel>
        )}
      />
    )
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={t('Configure Sources', '配置热点源')}
      actions={(
        <ActionPanel>
          <CommonActions />
        </ActionPanel>
      )}
    >
      <List.Item
        title={t('Drag and drop to reorder sources, or use the actions to move them up/down', '拖拽重新排序，或使用操作按钮上下移动')}
        icon={Icon.Info}
        actions={(
          <ActionPanel>
            <CommonActions />
          </ActionPanel>
        )}
      />

      {/* Enabled Sources */}
      <List.Section title={t('Enabled Sources', '已启用的热点源')}>
        {groupedSources.enabled.map((source, index) => (
          <SourceItem
            key={source.id}
            source={source}
            index={index}
            showMoveActions={true}
          />
        ))}
      </List.Section>

      {/* Disabled Sources */}
      {groupedSources.disabled.length > 0 && (
        <List.Section title={t('Disabled Sources', '已禁用的热点源')}>
          {groupedSources.disabled.map(source => (
            <SourceItem
              key={source.id}
              source={source}
            />
          ))}
        </List.Section>
      )}
    </List>
  )
}
