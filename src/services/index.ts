import type { TrendingType } from './definitions'
import { kebabToPascalCase } from '../utils/string'
import * as bilibili from './bilibili.service'
import { serviceDefinitions } from './definitions'
import * as douyin from './douyin.service'
import * as tieba from './tieba.service'
import * as weibo from './weibo.service'

const allHooks = { ...bilibili, ...douyin, ...tieba, ...weibo }

export const trendingHookMap = Object.fromEntries(
  serviceDefinitions.map((service) => {
    const hookName = `use${kebabToPascalCase(service.id)}`
    const hook = (allHooks as Record<string, () => any>)[hookName]

    if (!hook) {
      return []
    }
    return [service.id, hook]
  }),
) as Record<TrendingType, () => any>
