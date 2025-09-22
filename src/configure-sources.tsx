import type { SourceOrderItem } from './logic/source'
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
import {
  getGroupedSourcesForConfig,
  resetToDefaultState,
  saveSourceConfig,

  toggleSourceInGroup,
} from './logic/source'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'

const i18n = {
  title: {
    en: 'Configure Sources',
    zh: '配置热点源',
  },
  description: {
    en: 'Drag and drop to reorder sources, or use the actions to move them up/down',
    zh: '拖拽重新排序，或使用操作按钮上下移动',
  },
  moveUp: {
    en: 'Move Up',
    zh: '上移',
  },
  moveDown: {
    en: 'Move Down',
    zh: '下移',
  },
  reset: {
    en: 'Reset to Default',
    zh: '恢复默认',
  },
  save: {
    en: 'Save Order',
    zh: '保存排序',
  },
  saved: {
    en: 'Source order saved!',
    zh: '热点源排序已保存！',
  },
  reset_done: {
    en: 'Reset to default order',
    zh: '已恢复默认排序',
  },
  confirmReset: {
    en: 'Confirm Reset',
    zh: '确认重置',
  },
  resetMessage: {
    en: 'Are you sure you want to reset all sources to default alphabetical order and enable all sources? This action cannot be undone.',
    zh: '确定要将所有热点源重置为默认的首字母排序并启用所有源吗？此操作无法撤销。',
  },
  confirmResetAction: {
    en: 'Reset',
    zh: '重置',
  },
  cancel: {
    en: 'Cancel',
    zh: '取消',
  },
  toggleSource: {
    en: 'Toggle Source',
    zh: '切换热点源',
  },
  enabled: {
    en: 'Enabled',
    zh: '已启用',
  },
  disabled: {
    en: 'Disabled',
    zh: '已禁用',
  },
  enabledSources: {
    en: 'Enabled Sources',
    zh: '已启用的热点源',
  },
  disabledSources: {
    en: 'Disabled Sources',
    zh: '已禁用的热点源',
  },
}

export default function ConfigureSources() {
  const [groupedSources, setGroupedSources] = useState<{
    enabled: SourceOrderItem[]
    disabled: SourceOrderItem[]
  }>({ enabled: [], disabled: [] })
  const [isLoading, setIsLoading] = useState(true)

  // 初始化源列表
  useEffect(() => {
    async function loadSources() {
      const grouped = await getGroupedSourcesForConfig(lang)
      setGroupedSources(grouped)
      setIsLoading(false)
    }

    loadSources()
  }, [])

  const moveSource = (fromIndex: number, toIndex: number) => {
    const { enabled } = groupedSources
    if (toIndex < 0 || toIndex >= enabled.length)
      return

    const newEnabled = [...enabled]
    const [movedSource] = newEnabled.splice(fromIndex, 1)
    newEnabled.splice(toIndex, 0, movedSource)

    setGroupedSources({
      ...groupedSources,
      enabled: newEnabled,
    })
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
      title: i18n.saved[lang],
    })
  }

  const resetToDefault = async () => {
    const confirmed = await confirmAlert({
      title: i18n.confirmReset[lang],
      message: i18n.resetMessage[lang],
      primaryAction: {
        title: i18n.confirmResetAction[lang],
        style: Alert.ActionStyle.Destructive,
      },
      dismissAction: {
        title: i18n.cancel[lang],
        style: Alert.ActionStyle.Cancel,
      },
    })

    if (!confirmed)
      return

    await resetToDefaultState()

    // 重新加载默认分组
    const grouped = await getGroupedSourcesForConfig(lang)
    setGroupedSources(grouped)

    showToast({
      style: Toast.Style.Success,
      title: i18n.reset_done[lang],
    })
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={i18n.title[lang]}
      actions={(
        <ActionPanel>
          <Action
            title={i18n.save[lang]}
            icon={Icon.SaveDocument}
            onAction={saveOrder}
            shortcut={{ macOS: { modifiers: ['cmd'], key: 's' }, windows: { modifiers: ['ctrl'], key: 's' } }}
          />
          <Action
            title={i18n.reset[lang]}
            icon={Icon.ArrowCounterClockwise}
            onAction={resetToDefault}
            shortcut={{ macOS: { modifiers: ['cmd'], key: 'r' }, windows: { modifiers: ['ctrl'], key: 'r' } }}
          />
        </ActionPanel>
      )}
    >
      <List.Item
        title={i18n.description[lang]}
        icon={Icon.Info}
        actions={(
          <ActionPanel>
            <Action
              title={i18n.save[lang]}
              icon={Icon.SaveDocument}
              onAction={saveOrder}
              shortcut={{ macOS: { modifiers: ['cmd'], key: 's' }, windows: { modifiers: ['ctrl'], key: 's' } }}
            />
            <Action
              title={i18n.reset[lang]}
              icon={Icon.ArrowCounterClockwise}
              onAction={resetToDefault}
              shortcut={{ macOS: { modifiers: ['cmd'], key: 'r' }, windows: { modifiers: ['ctrl'], key: 'r' } }}
            />
          </ActionPanel>
        )}
      />

      {/* 启用的源 */}
      <List.Section title={i18n.enabledSources[lang]}>
        {groupedSources.enabled.map((source, index) => (
          <List.Item
            key={source.id}
            title={source.title}
            subtitle={source.enabled ? i18n.enabled[lang] : i18n.disabled[lang]}
            icon={typeof source.icon === 'string'
              ? source.icon
              : { source: { light: source.icon.light, dark: source.icon.dark || source.icon.light } }}
            accessories={[
              { icon: source.enabled ? Icon.CheckCircle : Icon.XMarkCircle, tooltip: source.enabled ? i18n.enabled[lang] : i18n.disabled[lang] },
              { text: `#${index + 1}` },
            ]}
            actions={(
              <ActionPanel>
                <Action
                  title={i18n.toggleSource[lang]}
                  icon={source.enabled ? Icon.EyeSlash : Icon.Eye}
                  onAction={() => toggleSource(source.id)}
                />
                <Action
                  title={i18n.moveUp[lang]}
                  icon={Icon.ArrowUp}
                  onAction={() => moveSource(index, index - 1)}
                  shortcut={{ windows: { modifiers: ['shift'], key: 'arrowUp' }, macOS: { modifiers: ['shift'], key: 'arrowUp' } }}
                />
                <Action
                  title={i18n.moveDown[lang]}
                  icon={Icon.ArrowDown}
                  onAction={() => moveSource(index, index + 1)}
                  shortcut={{ windows: { modifiers: ['shift'], key: 'arrowDown' }, macOS: { modifiers: ['shift'], key: 'arrowDown' } }}
                />
                <ActionPanel.Section>
                  <Action
                    title={i18n.save[lang]}
                    icon={Icon.SaveDocument}
                    onAction={saveOrder}
                    shortcut={{ macOS: { modifiers: ['cmd'], key: 's' }, windows: { modifiers: ['ctrl'], key: 's' } }}
                  />
                  <Action
                    title={i18n.reset[lang]}
                    icon={Icon.ArrowCounterClockwise}
                    onAction={resetToDefault}
                    shortcut={{ macOS: { modifiers: ['cmd'], key: 'r' }, windows: { modifiers: ['ctrl'], key: 'r' } }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            )}
          />
        ))}
      </List.Section>

      {/* 禁用的源 */}
      {groupedSources.disabled.length > 0 && (
        <List.Section title={i18n.disabledSources[lang]}>
          {groupedSources.disabled.map(source => (
            <List.Item
              key={source.id}
              title={source.title}
              subtitle={i18n.disabled[lang]}
              icon={typeof source.icon === 'string'
                ? source.icon
                : { source: { light: source.icon.light, dark: source.icon.dark || source.icon.light } }}
              accessories={[
                { icon: Icon.XMarkCircle, tooltip: i18n.disabled[lang] },
              ]}
              actions={(
                <ActionPanel>
                  <Action
                    title={i18n.toggleSource[lang]}
                    icon={Icon.Eye}
                    onAction={() => toggleSource(source.id)}
                  />
                  <ActionPanel.Section>
                    <Action
                      title={i18n.save[lang]}
                      icon={Icon.SaveDocument}
                      onAction={saveOrder}
                      shortcut={{ macOS: { modifiers: ['cmd'], key: 's' }, windows: { modifiers: ['ctrl'], key: 's' } }}
                    />
                    <Action
                      title={i18n.reset[lang]}
                      icon={Icon.ArrowCounterClockwise}
                      onAction={resetToDefault}
                      shortcut={{ macOS: { modifiers: ['cmd'], key: 'r' }, windows: { modifiers: ['ctrl'], key: 'r' } }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              )}
            />
          ))}
        </List.Section>
      )}
    </List>
  )
}
