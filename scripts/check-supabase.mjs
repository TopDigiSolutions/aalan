// Supply a server key through stdin; never place credentials in command arguments.
const origin = process.argv[2];
if (!origin || new URL(origin).protocol !== "https:")
  throw new Error("Pass the HTTPS Supabase project URL.");
let input = "";
for await (const chunk of process.stdin) input += chunk;
const key = input.trim();
if (!key) throw new Error("Supply the API key through stdin.");
for (const [table, select] of [
  [
    "aalan_orders",
    "session_id,amount,currency,email,items,shipping,created_at",
  ],
  ["aalan_subscribers", "email,created_at"],
]) {
  const url = new URL(`/rest/v1/${table}`, origin);
  url.searchParams.set("select", select);
  url.searchParams.set("limit", "0");
  const response = await fetch(url, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null);
  console.log(
    JSON.stringify({
      table,
      status: response.status,
      code: result?.code ?? null,
      schemaAccessible: response.ok,
    }),
  );
  if (!response.ok) process.exitCode = 1;
}
