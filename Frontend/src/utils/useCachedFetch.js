import { useState, useEffect, useCallback, useRef } from "react";
import clientCache from "./cache";

/**
 * Custom React Hook for Stale-While-Revalidate Client Caching
 *
 * @param {string | null} key - Unique cache key (null disables auto-fetching)
 * @param {() => Promise<any>} fetcher - Async fetcher function
 * @param {object} options
 * @param {number} options.ttl - Cache duration in ms (default: 2 min)
 * @param {boolean} options.persist - Store in sessionStorage (default: false)
 * @param {boolean} options.enabled - Whether fetching is active (default: true)
 * @param {any} options.initialData - Initial fallback data
 */
export function useCachedFetch(key, fetcher, options = {}) {
  const {
    ttl = 2 * 60 * 1000,
    persist = false,
    enabled = true,
    initialData = null,
  } = options;

  const cached = key ? clientCache.get(key) : null;

  const [data, setData] = useState(() => (cached ? cached.data : initialData));
  const [loading, setLoading] = useState(() => (cached ? false : !!enabled && !!key));
  const [isStale, setIsStale] = useState(() => (cached ? cached.isStale : false));
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(
    async (forceNetwork = false) => {
      if (!key || !enabled) return;

      const currentCached = clientCache.get(key);

      // If fresh and not forced, return immediately
      if (currentCached && !currentCached.isStale && !forceNetwork) {
        setData(currentCached.data);
        setIsStale(false);
        setLoading(false);
        return currentCached.data;
      }

      // If stale exists, show stale data while revalidating
      if (currentCached && currentCached.isStale && !forceNetwork) {
        setData(currentCached.data);
        setIsStale(true);
        setLoading(false);
      } else if (!currentCached) {
        setLoading(true);
      }

      try {
        setError(null);
        const freshData = await clientCache._executeFetch(
          key,
          fetcherRef.current,
          ttl,
          persist
        );
        setData(freshData);
        setIsStale(false);
        return freshData;
      } catch (err) {
        console.error(`[useCachedFetch] Fetch failed for ${key}:`, err);
        setError(err);
        // Retain stale data if we have it
        if (!currentCached) {
          setData(null);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [key, enabled, ttl, persist]
  );

  // Auto-fetch on mount or when key/enabled changes
  useEffect(() => {
    if (!key || !enabled) return;

    const currentCached = clientCache.get(key);
    if (currentCached) {
      setData(currentCached.data);
      setIsStale(currentCached.isStale);
      setLoading(false);
      if (currentCached.isStale) {
        execute(false).catch(() => {});
      }
    } else {
      execute(false).catch(() => {});
    }

    // Subscribe to external cache updates/invalidations
    const unsubscribe = clientCache.subscribe((updatedKey, updatedData) => {
      if (updatedKey === key) {
        if (updatedData === null) {
          // Key was invalidated - re-fetch fresh data
          execute(true).catch(() => {});
        } else {
          setData(updatedData);
          setIsStale(false);
        }
      }
    });

    return () => unsubscribe();
  }, [key, enabled, execute]);

  /**
   * Optimistically update the cache and hook state
   */
  const mutate = useCallback(
    (newData, revalidate = false) => {
      if (key) {
        clientCache.set(key, newData, ttl, persist);
        setData(newData);
        if (revalidate) {
          execute(true).catch(() => {});
        }
      }
    },
    [key, ttl, persist, execute]
  );

  /**
   * Force network revalidation
   */
  const refresh = useCallback(() => {
    return execute(true);
  }, [execute]);

  return { data, loading, isStale, error, mutate, refresh };
}

export default useCachedFetch;
