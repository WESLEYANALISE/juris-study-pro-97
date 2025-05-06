
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to handle common error patterns in Supabase queries
 */
export const handleSupabaseError = (error: any, operation: string): void => {
  console.error(`Error during ${operation}:`, error);
};

/**
 * Performs a safe Supabase select query with proper error handling
 */
export async function safeSelect<T = any>(
  tableName: string,
  columns = '*',
  queryBuilder?: (query: any) => any
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using type assertion to overcome TypeScript limitations with dynamic table names
    let query = (supabase.from(tableName) as any).select(columns);
    
    if (queryBuilder) {
      query = queryBuilder(query);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, `select from ${tableName}`);
      return { data: null, error };
    }
    
    return { data: data as T[], error: null };
  } catch (error) {
    handleSupabaseError(error, `select from ${tableName}`);
    return { data: null, error };
  }
}

/**
 * Performs a safe Supabase insert operation with proper error handling
 */
export async function safeInsert<T = any>(
  tableName: string,
  values: any,
  options?: { returning?: string }
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using type assertion to overcome TypeScript limitations with dynamic table names
    const query = supabase.from(tableName) as any;
    const { data, error } = await query.insert(values, { returning: options?.returning || 'minimal' });
    
    if (error) {
      handleSupabaseError(error, `insert into ${tableName}`);
      return { data: null, error };
    }
    
    return { data: data as T[], error: null };
  } catch (error) {
    handleSupabaseError(error, `insert into ${tableName}`);
    return { data: null, error };
  }
}

/**
 * Performs a safe Supabase update operation with proper error handling
 */
export async function safeUpdate<T = any>(
  tableName: string,
  values: any,
  queryBuilder: (query: any) => any
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using type assertion to overcome TypeScript limitations with dynamic table names
    const query = supabase.from(tableName) as any;
    const updateQuery = query.update(values);
    const filteredQuery = queryBuilder(updateQuery);
    
    const { data, error } = await filteredQuery;
    
    if (error) {
      handleSupabaseError(error, `update in ${tableName}`);
      return { data: null, error };
    }
    
    return { data: data as T[], error: null };
  } catch (error) {
    handleSupabaseError(error, `update in ${tableName}`);
    return { data: null, error };
  }
}

/**
 * Performs a safe Supabase delete operation with proper error handling
 */
export async function safeDelete<T = any>(
  tableName: string,
  queryBuilder: (query: any) => any
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using type assertion to overcome TypeScript limitations with dynamic table names
    const query = supabase.from(tableName) as any;
    const deleteQuery = query.delete();
    const filteredQuery = queryBuilder(deleteQuery);
    
    const { data, error } = await filteredQuery;
    
    if (error) {
      handleSupabaseError(error, `delete from ${tableName}`);
      return { data: null, error };
    }
    
    return { data: data as T[], error: null };
  } catch (error) {
    handleSupabaseError(error, `delete from ${tableName}`);
    return { data: null, error };
  }
}
