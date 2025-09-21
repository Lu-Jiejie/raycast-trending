import type { SourceType } from '../sources'
import type { useCachedTrending } from './useCachedTrending'
import { sourceInfo } from '../sources'

export function useTrending(type: SourceType) {
  const source = sourceInfo.find(source => source.id === type)
  return source?.hook() as ReturnType<typeof useCachedTrending>
}
