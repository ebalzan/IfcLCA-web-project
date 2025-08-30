/**
 * Converts a snake_case string to camelCase
 * @param str - The snake_case string to convert
 * @returns The camelCase string
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Converts a camelCase string to snake_case
 * @param str - The camelCase string to convert
 * @returns The snake_case string
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Recursively transforms all keys in an object from snake_case to camelCase
 * @param obj - The object to transform
 * @returns A new object with camelCase keys
 */
export const transformSnakeToCamel = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformSnakeToCamel(item)) as T
  }

  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key)
      transformed[camelKey] = transformSnakeToCamel(value)
    }

    return transformed as T
  }

  return obj
}
