import type { TrendingType } from '../services'
import { trendingServices } from '../services'

export function useTrending(type: TrendingType) {
  return trendingServices[type].hook()
}
