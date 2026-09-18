import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// High-Performance In-Memory Cache for instant navigation (< 50ms)
const cache = new Map();
const CACHE_TTL = 90 * 1000; // 90 seconds TTL

const getCacheKey = (url, config = {}) => {
  const paramsStr = config.params ? JSON.stringify(config.params) : '';
  return `${config.baseURL || ''}${url}?${paramsStr}`;
};

// Store native get method
const originalGet = api.get.bind(api);

// Enhanced api.get with memory cache and background revalidation (Stale-While-Revalidate)
api.get = async function (url, config = {}) {
  const { bypassCache = false, ttl = CACHE_TTL, ...axiosConfig } = config;
  const key = getCacheKey(url, axiosConfig);

  // If cache is explicitly bypassed, hit network directly
  if (bypassCache) {
    const res = await originalGet(url, axiosConfig);
    cache.set(key, { data: res.data, timestamp: Date.now() });
    return res;
  }

  const cached = cache.get(key);
  const now = Date.now();

  // If cached data exists:
  if (cached) {
    const isFresh = now - cached.timestamp < ttl;
    
    // Background revalidation if older than 15s to keep data perpetually fresh
    if (!isFresh || (now - cached.timestamp > 15000)) {
      originalGet(url, axiosConfig)
        .then((res) => {
          cache.set(key, { data: res.data, timestamp: Date.now() });
        })
        .catch(() => {});
    }

    // Return instant cached response (0ms latency!)
    return {
      data: cached.data,
      status: 200,
      statusText: 'OK (from memory cache)',
      headers: {},
      config: axiosConfig,
      fromCache: true,
    };
  }

  // If not in cache, fetch from network and store
  const res = await originalGet(url, axiosConfig);
  cache.set(key, { data: res.data, timestamp: Date.now() });
  return res;
};

// Prefetch helper for hover/idle preloading
api.prefetch = (url, config = {}) => {
  const key = getCacheKey(url, config);
  if (!cache.has(key)) {
    originalGet(url, config)
      .then((res) => {
        cache.set(key, { data: res.data, timestamp: Date.now() });
      })
      .catch(() => {});
  }
};

// Clear entire cache or matching pattern
api.clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Request interceptor to automatically attach JWT token and invalidate on mutations
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Any mutation (POST, PUT, DELETE, PATCH) wipes stale cache
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      cache.clear();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('dayflow_token');
        localStorage.removeItem('dayflow_user');
        cache.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
