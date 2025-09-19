import type { TrendingType } from '../services/definitions'
import type { useCachedTrending } from './useCachedTrending'
import { trendingHookMap } from '../services'

export function useTrending(type: TrendingType) {
  return trendingHookMap[type]() as ReturnType<typeof useCachedTrending>
}
