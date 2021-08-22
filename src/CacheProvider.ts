import NodeCache from "node-cache";

export class CacheProvider {
  public constructor(private cache = new NodeCache()) {}

  public add<K, T>(key: K, value: T, ttl = 3600) {
    this.cache.set(key.toString(), value, ttl);
  }

  public find<T>(key: string | number): T {
    return this.cache.get<T>(key.toString());
  }
}
