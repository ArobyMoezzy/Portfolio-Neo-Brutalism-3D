import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Mengambil data dari API dengan status loading/error dan fungsi refetch
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [path, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, refetch };
}
