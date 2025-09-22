import type { SourceType } from '../sources'
import type { HookReturnType } from '../types'
import { sourceInfo } from '../sources'

export function useTrending(type: SourceType) {
  const source = sourceInfo.find(source => source.id === type)
  return source?.hook() as HookReturnType
}
