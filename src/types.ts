import type { SourceType } from './sources'

export interface TopicItem {
  id: string
  title: string
  url: string
  type: SourceType
  tag?: { value: string, color: string }
  description?: string
  extra?: Record<string, any>
}

export enum TagColor {
  // more red rather than red
  Blue = 'raycast-blue',
  Green = 'raycast-green',
  Magenta = 'raycast-magenta',
  Orange = 'raycast-orange',
  Purple = 'raycast-purple',
  Red = 'raycast-red',
  Yellow = 'raycast-yellow',
  PrimaryText = 'raycast-primary-text',
  SecondaryText = 'raycast-secondary-text',
}

export interface HookReturnType {
  data: TopicItem[] | null
  refresh: (force?: boolean) => Promise<void>
  isLoading: boolean
  error: Error | null
  timestamp: number
}
