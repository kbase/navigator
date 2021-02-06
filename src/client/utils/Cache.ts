/**
 * The Cache class provides a relatively simple generic string-key hash, with 
 * expiration and automatic cache monitoring.
 * 
 * @remarks
 * 
 * The class provides a hash-based caching service, in which the cache keys are
 * strings, the cached value is a generic T. It provides cache expiration with a 
 * default 5 minute time to live (ttl), and an automatic cache evaluation timer.
 * A cache item is evaluated for expiration whenever it is inspected, by the `has` 
 * or `get` method, as well as by the monitor, which runs by default at one minute
 * intervals whenever there is at least one item in the cache.
 */

// Default Time To Live (TTL) for cache items
const DEFAULT_TTL = 5 * 60 * 1000;

// Default interval between cache evaluations
const DEFAULT_MONITOR_INTERVAL = 60 * 1000;
export interface CacheData<T> {
    [key: string]: T;
}

/**
 * Encapsulates a cache entry
 */
interface CacheEntry<T> {
    /**
     * The raw value stored in the cache entry
     */
    value: T;
    /**
     * The time in milliseconds that the cache entry 
     * was created.
     */
    createdAt: number;
}

/**
 * Constructor parameters
 */
interface CacheConstructorParams {
    /**
     * Time to live for a cache entry, in milliseconds
     * Defaults to DEFAULT_TTL
     */
    ttl?: number;
    /**
     * Interval at which the cache monitor is run, when required,
     * in milliseconds.
     * Defaults to DEFAULT_MONITOR_INTERVAL
     */
    monitorInterval?: number;
}

/**
 * A generic caching class dedicated to storing values of a given type by a 
 * string key, with cache entry expiration and cache state monitoring.
 * 
 * @typeParam T - The type of value stored in the cache
 */
export default class Cache<T> {
    private cache: CacheData<CacheEntry<T>>;
    private ttl: number;
    private monitorInterval: number;
    private scheduleTimer: number | null;

    /**
     * 
     * @param CacheConstructorParams 
     */
    constructor({ ttl, monitorInterval }: CacheConstructorParams = {}) {
        this.cache = {};
        this.ttl = ttl || DEFAULT_TTL;
        this.monitorInterval = monitorInterval || DEFAULT_MONITOR_INTERVAL;
        this.scheduleTimer = null;
    }

    /**
     * The cache monitor is called whenever the cache state may have changed.
     * It will enter a setTimeout-based loop if it is not already running
     * and there are cache entries.
     * 
     * It will exit when there are no cache entries left.
     * 
     * @returns void
     * Returns nothing interesting
     */
    private scheduleEvaluation() {
        if (this.scheduleTimer !== null) {
            return;
        }
        this.scheduleTimer = window.setTimeout(() => {
            this.scheduleTimer = null;
            this.evaluateCache();
        }, this.monitorInterval);
    }

    /**
     * Cancels the scheduler timer.
     * 
     * @returns void
     * Returns nothing interesting.
     */
    private cancelScheduler() {
        if (this.scheduleTimer !== null) {
            window.clearTimeout(this.scheduleTimer);
        }
    }

    /**
     * Evaluates the cache by evaluating each cache key, ensuring 
     * at completion that the cache only contains valid, unexpired
     * entries.
     * 
     * @returns void
     * Returns nothing interesting
     */
    private evaluateCache() {
        Object.keys(this.cache).forEach((key) => {
            this.evaluateKey(key);
        });
        if (Object.keys(this.cache).length > 0) {
            this.scheduleEvaluation();
        }
    }

    /**
     * Given a cache key, evaluates the entry to determine if it 
     * has expired, and if so, removes it from the cache.
     * 
     * @param key - A cache key
     * @returns void
     * Returns nothing interesting
     */
    private evaluateKey(key: string) {
        if (!(key in this.cache)) {
            return;
        }
        const cacheRecord = this.cache[key];
        if ((cacheRecord.createdAt + this.ttl) < Date.now()) {
            delete this.cache[key];
        }
    }

    /**
     * Given a key, returns whether a valid cache entry would be returned
     * for it.
     * 
     * Note that it evaluates the cache entry, if any, first, which 
     * may expire (and remove) the cache item.
     * 
     * @param key 
     * @returns boolean
     * Returns whether the key for a valid entry exists in the cache.
     */
    public has(key: string) {
        this.evaluateKey(key);
        return key in this.cache;
    }

    /**
     * Sets a cache entry given string key and a value of type T.
     * 
     * Note that this triggers the cache monitor to start, if it is
     * not already started.
     * 
     * @param key 
     * @param data 
     * @returns void
     * Returns nothing interesting
     */
    public set(key: string, value: T) {
        this.cache[key] = {
            value,
            createdAt: Date.now()
        };
        this.scheduleEvaluation();
    }

    /**
     * Returns the cache entry for a given key.
     * 
     * Note that this method throws if the key does not match a cache
     * entry. `get` should be used in conjunction  with `has` to 
     * prevent an error. This is intentional, because the user of a cache
     * should be prepared to set a cache value if it does not exist in 
     * the cache.
     * 
     * An alternative design could be for the `get` method to fetch and install
     * a cache value if it is missing. However, it does not seem worth the 
     * complexity, given that it would also constrain the usage of the cache.
     * 
     * @param key - A cache key
     * @returns The associated cache entry
     * 
     * @throws Error
     * Thrown if the key does not exist in the cache.
     */
    public get(key: string): T {
        this.evaluateKey(key);
        if (!(key in this.cache)) {
            throw new Error('Key not in cache, please check for existence first with "has"');
        }
        return this.cache[key].value;
    }

    /**
     * Removes the cache entry, if any, associated with the given key.
     * 
     * @param key - A potential cache key
     * @returns void
     * Returns nothing interesting
     */
    public remove(key: string) {
        if (!(key in this.cache)) {
            return;
        }
        delete this.cache[key];
    }

    /**
     * Clears the entire cache.
     * 
     * @returns void
     * Returns nothing interesting
     */
    public clear() {
        this.cache = {};
        this.cancelScheduler();
    }

    /**
     * Returns the current size of the cache, regardless of cache
     * entry expiration status.
     * 
     * @returns number
     * Returns the current number of cache entries
     */
    public size(): number {
        return Object.keys(this.cache).length;
    }
}
