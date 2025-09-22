import type { SourceType } from '../config/sourceInfo'
import type { HookReturnType } from '../types'
import { sourceInfo } from '../config/sourceInfo'

export function useTrending(type: SourceType) {
  const source = sourceInfo.find(source => source.id === type)
  return source?.hook() as HookReturnType
}
