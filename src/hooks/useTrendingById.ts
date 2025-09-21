import type { SourceId } from '../sources'
import type { useCachedTrending } from './useCachedTrending'
import { sourceInfo } from '../sources'

export function useTrending(id: SourceId) {
  const source = sourceInfo.find(source => source.id === id)
  return source?.hook() as ReturnType<typeof useCachedTrending>
}
