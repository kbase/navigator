export interface CacheData<T> {
    [key: string]: T;
}

interface CacheRecord<T> {
    value: T;
    createdAt: number;
}

// Default expiration for cache items.
const DEFAULT_TTL = 5 * 60 * 1000;
const DEFAULT_MONITOR_INTERVAL = 60000;

interface CacheConstructorParams {
    ttl?: number;
    monitorInterval?: number;
}

export default class Cache<T> {
    private cache: CacheData<CacheRecord<T>>;
    private ttl: number;
    private monitorInterval: number;
    monitorTimer: number | null;
    constructor({ ttl, monitorInterval }: CacheConstructorParams = {}) {
        this.cache = {};
        this.ttl = ttl || DEFAULT_TTL;
        this.monitorInterval = monitorInterval || DEFAULT_MONITOR_INTERVAL;
        this.monitorTimer = null;
    }

    has(key: string) {
        this.evaluateKey(key);
        return key in this.cache;
    }

    set(key: string, data: T) {
        this.cache[key] = {
            value: data,
            createdAt: Date.now()
        };
        this.monitorCache();
    }

    monitorCache() {
        if (Object.keys(this.cache).length === 0) {
            return;
        }
        if (this.monitorTimer !== null) {
            return;
        }
        const monitor = () => {
            this.monitorTimer = window.setTimeout(() => {
                Object.keys(this.cache).forEach((key) => {
                    this.evaluateKey(key);
                });
                if (Object.keys(this.cache).length > 0) {
                    monitor();
                }
                this.monitorTimer = null;
            }, this.monitorInterval);
        };
        monitor();
    }

    evaluateKey(key: string) {
        if (!(key in this.cache)) {
            return;
        }
        const cacheRecord = this.cache[key];
        if ((cacheRecord.createdAt + this.ttl) < Date.now()) {
            delete this.cache[key];
        }
    }

    get(key: string): T {
        this.evaluateKey(key);

        if (!(key in this.cache)) {
            throw new Error('Key not in cache, please check for existence first with "has"');
        }
        return this.cache[key].value;
    }

    remove(key: string) {
        if (key in this.cache) {
            delete this.cache[key];
        }
        this.monitorCache();
    }

    clear() {
        this.cache = {};
        this.monitorCache();
    }

    size() {
        return Object.keys(this.cache).length;
    }
}