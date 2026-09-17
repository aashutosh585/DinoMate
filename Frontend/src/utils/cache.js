/**
 * 🦖 DinoMate Client-Side Cache Manager
 *
 * Features:
 * - High-speed In-Memory LRU Cache with TTL (Time-To-Live)
 * - SessionStorage persistence for critical lists (persists page reload)
 * - In-flight request deduplication (prevents duplicate simultaneous calls)
 * - Stale-While-Revalidate (SWR) support
 * - Namespace and pattern-based cache invalidation
 */

const MAX_CACHE_SIZE = 120;
const SESSION_CACHE_PREFIX = "dinomate_cache_";

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.inFlightRequests = new Map();
    this.listeners = new Set();
  }

  /**
   * Generates a storage key for sessionStorage
   */
  _sessionKey(key) {
    return `${SESSION_CACHE_PREFIX}${key}`;
  }

  /**
   * Set a cache entry
   * @param {string} key
   * @param {any} data
   * @param {number} ttlMs - TTL in milliseconds (default: 2 minutes)
   * @param {boolean} persistSession - Whether to persist to sessionStorage
   */
  set(key, data, ttlMs = 2 * 60 * 1000, persistSession = false) {
    if (!key) return;

    // LRU eviction if cache exceeds capacity
    if (this.memoryCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    const entry = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      expiresAt: Date.now() + ttlMs,
    };

    this.memoryCache.set(key, entry);

    if (persistSession && typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(this._sessionKey(key), JSON.stringify(entry));
      } catch (e) {
        // Storage full or private mode quota exceeded - ignore safely
      }
    }

    this._notifyListeners(key, data);
  }

  /**
   * Get cached item if valid
   * @param {string} key
   * @returns {{ data: any, isStale: boolean } | null}
   */
  get(key) {
    if (!key) return null;

    // 1. Check in-memory cache
    let entry = this.memoryCache.get(key);

    // 2. Fallback to sessionStorage
    if (!entry && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = window.sessionStorage.getItem(this._sessionKey(key));
        if (stored) {
          entry = JSON.parse(stored);
          if (entry && entry.expiresAt > Date.now()) {
            this.memoryCache.set(key, entry);
          } else {
            window.sessionStorage.removeItem(this._sessionKey(key));
            entry = null;
          }
        }
      } catch (e) {
        entry = null;
      }
    }

    if (!entry) return null;

    const isExpired = Date.now() > entry.expiresAt;
    return {
      data: entry.data,
      isStale: isExpired,
      timestamp: entry.timestamp,
    };
  }

  /**
   * Check if a valid, non-expired cache entry exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const cached = this.get(key);
    return cached !== null && !cached.isStale;
  }

  /**
   * Invalidate a single key
   * @param {string} key
   */
  invalidate(key) {
    if (!key) return;
    this.memoryCache.delete(key);
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(this._sessionKey(key));
      } catch (e) {}
    }
    this._notifyListeners(key, null);
  }

  /**
   * Invalidate all keys matching a namespace prefix
   * e.g., invalidateNamespace("jobs") matches "jobs:page:0", "jobs:search:xyz"
   * @param {string} prefix
   */
  invalidateNamespace(prefix) {
    if (!prefix) return;

    // Invalidate memory keys
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        this._notifyListeners(key, null);
      }
    }

    // Invalidate sessionStorage keys
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const fullPrefix = `${SESSION_CACHE_PREFIX}${prefix}`;
        const keysToRemove = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(fullPrefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
      } catch (e) {}
    }
  }

  /**
   * Invalidate all keys matching a RegExp pattern
   * @param {RegExp} regex
   */
  invalidatePattern(regex) {
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  /**
   * Completely clear all cached data
   */
  clear() {
    this.memoryCache.clear();
    this.inFlightRequests.clear();
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(SESSION_CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
      } catch (e) {}
    }
  }

  /**
   * Fetch with cache + deduplication + Stale-While-Revalidate (SWR)
   *
   * @param {string} key - Unique cache key
   * @param {() => Promise<any>} fetcher - Async function that performs the network request
   * @param {object} options
   * @param {number} options.ttl - Cache TTL in ms (default: 2 min)
   * @param {boolean} options.swr - Return stale cache while revalidating in background (default: true)
   * @param {boolean} options.persist - Persist to sessionStorage (default: false)
   * @param {(freshData: any) => void} options.onRevalidated - Callback when background revalidation finishes
   */
  async fetchWithCache(key, fetcher, options = {}) {
    const {
      ttl = 2 * 60 * 1000,
      swr = true,
      persist = false,
      onRevalidated = null,
    } = options;

    const cached = this.get(key);

    // 1. Fresh cache hit -> return immediately
    if (cached && !cached.isStale) {
      return cached.data;
    }

    // 2. Stale cache hit + SWR enabled
    if (cached && cached.isStale && swr) {
      // Trigger background revalidation if not already in flight
      this._executeFetch(key, fetcher, ttl, persist)
        .then((freshData) => {
          if (onRevalidated) onRevalidated(freshData);
        })
        .catch(() => {});
      return cached.data;
    }

    // 3. Cache miss or expired without SWR -> perform network request
    return this._executeFetch(key, fetcher, ttl, persist);
  }

  /**
   * Internal deduplicated fetcher
   */
  async _executeFetch(key, fetcher, ttl, persist) {
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        if (result !== undefined && result !== null) {
          this.set(key, result, ttl, persist);
        }
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  /**
   * Subscription listener for cache updates
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notifyListeners(key, data) {
    for (const listener of this.listeners) {
      try {
        listener(key, data);
      } catch (e) {}
    }
  }
}

// Export singleton instance
export const clientCache = new CacheManager();
export default clientCache;
