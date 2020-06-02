/**
 * A class that provides runtime utilities.
 */
import Config from '../config';
import { getToken } from './auth';

const CONFIG = Config.Instance;

export default class Runtime {
    static username = () => window._env.username || undefined;

    static getConfig = () => CONFIG;

    static token = () => getToken();
}
