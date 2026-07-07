/**
 * Creates a plain object omitting any `undefined` values.
 * Useful for building partial DB update objects from validated schema data,
 * where optional fields are `undefined` when not provided by the client.
 *
 * Fields explicitly set to `null` are preserved (for nullable DB columns).
 *
 * @example
 * const data = { name: 'Foo', slug: undefined, description: 'Bar' };
 * omitUndefined(data); // → { name: 'Foo', description: 'Bar' }
 */
export function omitUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
