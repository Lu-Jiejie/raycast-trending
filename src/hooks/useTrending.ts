import type { TrendingType } from '../services/definitions'
import type { useCachedTrending } from './useCachedTrending'
import { trendingServices } from '../services'

export function useTrending(type: TrendingType) {
  return trendingServices[type].hook() as ReturnType<typeof useCachedTrending>
}
