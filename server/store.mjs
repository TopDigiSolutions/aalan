import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openStore(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS orders (session_id TEXT PRIMARY KEY, amount INTEGER NOT NULL, currency TEXT NOT NULL, email TEXT, items TEXT NOT NULL, shipping TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  return {
    saveOrder(session, items) {
      db.prepare(
        "INSERT OR IGNORE INTO orders (session_id,amount,currency,email,items,shipping) VALUES (?,?,?,?,?,?)",
      ).run(
        session.id,
        session.amount_total,
        session.currency,
        session.customer_details?.email ?? null,
        JSON.stringify(items),
        JSON.stringify(
          session.collected_information?.shipping_details ??
            session.shipping_details ??
            null,
        ),
      );
    },
    order(id) {
      return db
        .prepare(
          "SELECT session_id,amount,currency,created_at FROM orders WHERE session_id=?",
        )
        .get(id);
    },
    subscribe(email) {
      db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(
        email,
      );
    },
    close() {
      db.close();
    },
  };
}
