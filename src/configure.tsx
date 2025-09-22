import type { Image } from '@raycast/api'
import type { SourceOrderItem } from './types'
import { Action, ActionPanel, Alert, Color, confirmAlert, getPreferenceValues, Icon, List, showToast, Toast } from '@raycast/api'
import { useEffect, useState } from 'react'
import { t } from './logic'
import {
  getGroupedSourcesForConfig,
  resetToDefaultState,
  saveSourceConfig,
} from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'

function getIconSource(icon: string | { light: string, dark?: string }) {
  return typeof icon === 'string' ? icon : { source: { light: icon.light, dark: icon.dark || icon.light } }
}

export default function Configure() {
  const [groupedSources, setGroupedSources] = useState<{
    enabled: SourceOrderItem[]
    disabled: SourceOrderItem[]
  }>({ enabled: [], disabled: [] })
  const [isLoading, setIsLoading] = useState(true)
  // Track selected item to maintain focus when items are moved or toggled
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)

  useEffect(() => {
    async function loadSources() {
      const grouped = await getGroupedSourcesForConfig(lang)
      setGroupedSources(grouped)
      setIsLoading(false)

      // Set initial selection to first enabled source
      if (grouped.enabled.length > 0) {
        setSelectedSourceId(grouped.enabled[0].id)
      }
    }

    loadSources()
  }, [])

  // Move a source up or down in the list and maintain selection on the moved item
  const moveSource = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= groupedSources.enabled.length)
      return

    const newEnabled = [...groupedSources.enabled]
    const [movedSource] = newEnabled.splice(fromIndex, 1)
    newEnabled.splice(toIndex, 0, movedSource)

    setSelectedSourceId(movedSource.id)
    setGroupedSources(prev => ({ ...prev, enabled: newEnabled }))
  }

  // Toggle a source between enabled and disabled states
  const toggleSource = (sourceId: string) => {
    // Create new state object to avoid mutating existing state
    const newEnabled = [...groupedSources.enabled]
    const newDisabled = [...groupedSources.disabled]

    // Find the source in either enabled or disabled array
    const enabledIndex = newEnabled.findIndex(s => s.id === sourceId)
    const disabledIndex = newDisabled.findIndex(s => s.id === sourceId)

    if (enabledIndex >= 0) {
      // Toggle the enabled state but keep it in the same list
      newEnabled[enabledIndex] = {
        ...newEnabled[enabledIndex],
        enabled: !newEnabled[enabledIndex].enabled,
      }
    }
    else if (disabledIndex >= 0) {
      // Remove from disabled and add to enabled at the end
      const source = { ...newDisabled[disabledIndex], enabled: true }
      newDisabled.splice(disabledIndex, 1)
      newEnabled.push(source) // Add to the end of enabled list
    }

    // Update the state with our modified arrays
    setGroupedSources({ enabled: newEnabled, disabled: newDisabled })
    setSelectedSourceId(sourceId)
  }

  // Save current order and enabled state to persistent storage
  const saveOrder = async () => {
    const { enabled, disabled } = groupedSources
    const allSources = [...enabled, ...disabled]

    // Get the real order of all sources (both enabled and disabled)
    const order = allSources.map(s => s.id)

    // Only save sources that have enabled=true property as enabled
    const enabledSourceIds = allSources.filter(s => s.enabled).map(s => s.id)

    await saveSourceConfig(order, enabledSourceIds)

    // Reload sources from storage to apply the changes properly
    const grouped = await getGroupedSourcesForConfig(lang)
    setGroupedSources(grouped)

    // Try to maintain current selection if possible
    if (selectedSourceId) {
      setSelectedSourceId(selectedSourceId)
    }

    showToast({
      style: Toast.Style.Success,
      title: t('Source settings saved!', '热点源设置已保存！'),
    })
  }

  // Reset to default alphabetical order and enable all sources
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

  // Common actions shared across multiple ActionPanels
  const CommonActions = () => (
    <>
      <Action
        title={t('Save Settings', '保存设置')}
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

  // Reusable List.Item component for source entries
  const SourceItem = ({
    source,
    index,
    showMoveActions = false,
  }: {
    source: SourceOrderItem
    index?: number
    showMoveActions?: boolean
  }) => {
    // Now we use the actual source.enabled property
    const isEnabled = source.enabled

    const statusIcon: Image.ImageLike = isEnabled
      ? { source: Icon.CheckCircle, tintColor: Color.Green }
      : { source: Icon.XMarkCircle, tintColor: Color.Red }
    const statusText = isEnabled ? t('Enabled', '已启用') : t('Disabled', '已禁用')
    const toggleIcon = isEnabled ? Icon.EyeSlash : Icon.Eye
    const iconSource = getIconSource(source.icon)

    return (
      <List.Item
        id={source.id}
        key={source.id}
        title={source.title}
        // subtitle={statusText}
        icon={iconSource}
        accessories={[
          { icon: statusIcon, tooltip: statusText },
          ...(index !== undefined ? [{ text: `#${index + 1}` }] : []),
        ]}
        actions={(
          <ActionPanel>
            <Action
              title={isEnabled ? t('Disable Source', '禁用热点源') : t('Enable Source', '启用热点源')}
              icon={toggleIcon}
              onAction={() => {
                // Just call toggleSource directly
                toggleSource(source.id)
              }}
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
      selectedItemId={selectedSourceId || undefined}
      onSelectionChange={id => setSelectedSourceId(id || null)}
      searchBarPlaceholder={t('Configure display or order of sources...', '配置热点源的启用状态和顺序...')}
      actions={(
        <ActionPanel>
          <CommonActions />
        </ActionPanel>
      )}
    >
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
