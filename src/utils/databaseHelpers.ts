
/**
 * This utility file contains helper functions for working with Supabase/database data 
 * that might need type casting to avoid TypeScript errors.
 */

/**
 * Cast database results to a specific type to help TypeScript recognize the shape
 * of data coming from tables or views that aren't in the auto-generated types.
 * 
 * @param data The data to cast
 * @returns The same data with the correct type
 */
export function castDbResult<T>(data: any): T {
  return data as T;
}

/**
 * Type assertion for array data returned from database queries
 * 
 * @param data Array data to cast
 * @returns The same array with the correct item type
 */
export function castDbArrayResult<T>(data: any[]): T[] {
  return data as T[];
}
