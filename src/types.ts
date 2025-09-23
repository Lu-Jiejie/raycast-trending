import type { SourceType } from './config/sourceInfo'

export interface TrendingItem {
  id: string
  title: string
  url: string
  type: SourceType
  tag?: { value: string, color: string }
  hotValue?: number
  description?: string
  extra?: Record<string, any>
}

export enum TagColor {
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
  data: TrendingItem[] | null
  refresh: (force?: boolean) => Promise<void>
  isLoading: boolean
  error: Error | null
  timestamp: number
}

export interface SourceOrderItem {
  id: string
  title: string
  subTitle: string
  icon: string | { light: string, dark: string }
  enabled: boolean
}
