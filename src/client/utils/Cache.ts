export interface CacheData<T> {
    [key: string]: T;
}

interface CacheRecord<T> {
    value: T;
    createdAt: number;
}

// Default expiration for cache items.
const DEFAULT_EXPIRES_AFTER = 5 * 60 * 1000;

export default class Cache<T> {
    private cache: CacheData<CacheRecord<T>>;
    private expireAfter: number;
    constructor(expireAfter?: number) {
        this.cache = {};
        this.expireAfter = expireAfter || DEFAULT_EXPIRES_AFTER;
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
    }

    evaluateKey(key: string) {
        if (!(key in this.cache)) {
            return;
        }
        const cacheRecord = this.cache[key];
        if ((cacheRecord.createdAt + this.expireAfter) < Date.now()) {
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
    }

    clear() {
        this.cache = {};
    }

    size() {
        return Object.keys(this.cache).length;
    }
}