import type { TrendingType } from './definitions'
import { kebabToPascalCase } from '../utils/string'
import * as bilibili from './bilibili.service'
import { serviceDefinitions } from './definitions'
import * as douyin from './douyin.service'
import * as tieba from './tieba.service'
import * as weibo from './weibo.service'

const allHooks = { ...bilibili, ...douyin, ...tieba, ...weibo }

export const trendingServices = Object.fromEntries(
  serviceDefinitions.map((service) => {
    const hookName = `use${kebabToPascalCase(service.id)}`
    const hook = (allHooks as Record<string, () => any>)[hookName]

    if (!hook) {
      throw new Error(
        `Hook not found for service ID: "${service.id}". Expected to find an exported function named "${hookName}".`,
      )
    }

    return [
      service.id,
      {
        title: service.title,
        hook,
      },
    ]
  }),
) as Record<TrendingType, { title: string, hook: () => any }>
