
import { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * A utility function to safely query Supabase tables with proper type handling
 * This helps bypass TypeScript errors when tables are not strictly typed
 */
export const safeQueryFrom = <T = any>(
  tableName: string
): PostgrestFilterBuilder<any, any, T[], any> => {
  // Using type assertion to avoid TypeScript errors with database schema
  return supabase.from(tableName as any) as any;
};

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
  queryBuilder?: (query: PostgrestFilterBuilder<any, any, T[], any>) => PostgrestFilterBuilder<any, any, T[], any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    let query = safeQueryFrom<T>(tableName).select(columns);
    
    if (queryBuilder) {
      query = queryBuilder(query);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, `select from ${tableName}`);
      return { data: null, error };
    }
    
    return { data, error: null };
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
    // Using 'as any' to bypass TypeScript errors with Supabase client
    const { data, error } = await (safeQueryFrom(tableName) as any)
      .insert(values, options);
    
    if (error) {
      handleSupabaseError(error, `insert into ${tableName}`);
      return { data: null, error };
    }
    
    return { data, error: null };
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
  queryBuilder: (query: PostgrestFilterBuilder<any, any, T[], any>) => PostgrestFilterBuilder<any, any, T[], any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using 'as any' to bypass TypeScript errors with Supabase client
    let query = (safeQueryFrom(tableName) as any).update(values);
    query = queryBuilder(query);
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, `update in ${tableName}`);
      return { data: null, error };
    }
    
    return { data, error: null };
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
  queryBuilder: (query: PostgrestFilterBuilder<any, any, T[], any>) => PostgrestFilterBuilder<any, any, T[], any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Using 'as any' to bypass TypeScript errors with Supabase client
    let query = (safeQueryFrom(tableName) as any).delete();
    query = queryBuilder(query);
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, `delete from ${tableName}`);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    handleSupabaseError(error, `delete from ${tableName}`);
    return { data: null, error };
  }
}
