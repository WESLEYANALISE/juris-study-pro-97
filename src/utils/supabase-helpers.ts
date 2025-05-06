
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
    // We need to use a double type assertion to bypass TypeScript's type checking
    // for dynamic table names
    const query = supabase.from(tableName as any) as any;
    let builtQuery = query.select(columns);
    
    if (queryBuilder) {
      builtQuery = queryBuilder(builtQuery);
    }
    
    const { data, error } = await builtQuery;
    
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
    // We need to use a double type assertion to bypass TypeScript's type checking
    const query = supabase.from(tableName as any) as any;
    
    // Use the options parameter correctly
    const insertOptions = { returning: options?.returning || 'minimal' };
    const { data, error } = await query.insert(values, insertOptions);
    
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
    // We need to use a double type assertion to bypass TypeScript's type checking
    const query = supabase.from(tableName as any) as any;
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
    // We need to use a double type assertion to bypass TypeScript's type checking
    const query = supabase.from(tableName as any) as any;
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
