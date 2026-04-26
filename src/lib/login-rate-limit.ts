import "server-only";

type AttemptEntry = {
  count: number;
  resetAt: number;
};

type LoginAttemptStore = Map<string, AttemptEntry>;

declare global {
  var __matsukasaLoginAttempts: LoginAttemptStore | undefined;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getStore() {
  if (!globalThis.__matsukasaLoginAttempts) {
    globalThis.__matsukasaLoginAttempts = new Map();
  }

  return globalThis.__matsukasaLoginAttempts;
}

function getFreshEntry(key: string) {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const entry = {
      count: 0,
      resetAt: now + WINDOW_MS,
    };
    store.set(key, entry);
    return entry;
  }

  return existing;
}

export function isLoginRateLimited(key: string) {
  const entry = getFreshEntry(key);
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLoginAttempt(key: string) {
  const entry = getFreshEntry(key);
  entry.count += 1;
  getStore().set(key, entry);
}

export function clearLoginRateLimit(key: string) {
  getStore().delete(key);
}
