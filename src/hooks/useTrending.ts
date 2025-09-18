import type { TrendingServiceKey } from '../services'
import { trendingServices } from '../services'

export function useTrending(type: TrendingServiceKey) {
  return trendingServices[type].hook()
}
