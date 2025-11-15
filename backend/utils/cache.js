import NodeCache from "node-cache";

const cache = new NodeCache();

export const cacheGet = (k) => cache.get(k);
export const cacheSet = (k, v, ttlSeconds = 3600) =>
  cache.set(k, v, ttlSeconds);
export const cacheDel = (k) => cache.del(k);
