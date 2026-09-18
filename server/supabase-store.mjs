import { createClient } from "@supabase/supabase-js";

export function openSupabaseStore(url, secretKey, fetchImpl = fetch) {
  const client = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init = {}) =>
        fetchImpl(input, {
          ...init,
          signal: init.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(10_000)])
            : AbortSignal.timeout(10_000),
        }),
    },
  });
  function check(error) {
    if (error)
      throw new Error(
        "Supabase storage operation failed. Verify database configuration and schema.",
      );
  }
  return {
    async saveOrder(session, items) {
      const { error } = await client.from("aalan_orders").upsert(
        {
          session_id: session.id,
          amount: session.amount_total,
          currency: session.currency,
          email: session.customer_details?.email ?? null,
          items,
          shipping:
            session.collected_information?.shipping_details ??
            session.shipping_details ??
            null,
        },
        { onConflict: "session_id", ignoreDuplicates: true },
      );
      check(error);
    },
    async order(id) {
      const { data, error } = await client
        .from("aalan_orders")
        .select("session_id,amount,currency,created_at")
        .eq("session_id", id)
        .limit(1);
      check(error);
      return data[0];
    },
    async subscribe(email) {
      const { error } = await client
        .from("aalan_subscribers")
        .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
      check(error);
    },
    close() {},
  };
}
