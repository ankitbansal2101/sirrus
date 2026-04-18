import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseBrowserEnvOptional } from "@/lib/supabase/env";

/**
 * Server Components, Server Actions, Route Handlers.
 * Cookie writes may no-op in RSC; middleware refreshes auth cookies.
 */
export async function createClient() {
  const env = getSupabaseBrowserEnvOptional();
  if (!env) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* set from Server Component — middleware handles session refresh */
        }
      },
    },
  });
}
