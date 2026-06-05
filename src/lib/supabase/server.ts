import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseAnonConfig {
  anonKey: string;
  url: string;
}

export interface SupabaseServiceConfig {
  serviceRoleKey: string;
  url: string;
}

export function getSupabaseAnonConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseAnonConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { anonKey, url };
}

export function getSupabaseServiceConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseServiceConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { serviceRoleKey, url };
}

export function createSupabaseAnonClient(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseClient {
  const config = getSupabaseAnonConfig(env);

  if (!config) {
    throw new Error("Supabase anon environment variables are not configured.");
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createSupabaseServiceClient(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseClient {
  const config = getSupabaseServiceConfig(env);

  if (!config) {
    throw new Error("Supabase service-role environment variables are not configured.");
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
