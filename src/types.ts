import type { TrendingType } from './sources/definitions'

export interface TopicItem {
  id: string
  title: string
  url: string
  type: TrendingType
  description?: string
  extra?: Record<string, any>
}

export enum TagColor {
  // more red rather than red
  DeepRed = '#FF3B30',
  // extend from Raycast's built-in colors
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
