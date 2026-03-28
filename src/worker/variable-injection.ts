/**
 * Resolves {{nodeId.output}} placeholders in config string fields.
 * Supports nested objects and arrays (e.g. LLMChain steps).
 */
export function resolveConfigVariables(
  config: Record<string, unknown>,
  nodeOutputs: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(config)) {
    resolved[key] = resolveValue(value, nodeOutputs)
  }
  return resolved
}

function resolveValue(value: unknown, nodeOutputs: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    return resolveString(value, nodeOutputs)
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, nodeOutputs))
  }
  if (value !== null && typeof value === 'object') {
    return resolveConfigVariables(value as Record<string, unknown>, nodeOutputs)
  }
  return value
}

function resolveString(template: string, nodeOutputs: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+?)\.output\}\}/g, (match, nodeId) => {
    const output = nodeOutputs[nodeId.trim()]
    if (output === undefined) return match
    return typeof output === 'string' ? output : JSON.stringify(output, null, 2)
  })
}
