import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseServerConfig {
  anonKey: string;
  url: string;
}

export function getSupabaseServerConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseServerConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { anonKey, url };
}

export function createSupabaseServerClient(
  env: Partial<NodeJS.ProcessEnv> = process.env
): SupabaseClient {
  const config = getSupabaseServerConfig(env);

  if (!config) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
