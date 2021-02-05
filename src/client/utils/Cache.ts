export interface CacheData<T> {
    [key: string]: T;
}


export default class Cache<T> {
    private cache: CacheData<T>;

    constructor() {
        this.cache = {};
    }

    has(key: string) {
        return key in this.cache;
    }

    set(key: string, data: T) {
        this.cache[key] = data;
    }

    get(key: string, defaultValue?: T) {
        if (key in this.cache) {
            return this.cache[key];
        }
        return defaultValue;
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