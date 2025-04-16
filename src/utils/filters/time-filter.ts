import { defaultFilterRegistry } from '../filter-registry.js'

export function createTimeCondition(params: URLSearchParams) {
  const timeType = params.get('time')
  if (!timeType) return null

  return (href: string, tags: string[], meta: Record<string, any>) => {
    const timestamp = timeType === 'created' ? meta.created : meta.updated
    // 使用解构后的参数进行判断
    return true
  }
}

// 注册时关联参数名
defaultFilterRegistry.register('time', createTimeCondition)
