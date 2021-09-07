/**
 * A class that provides runtime utilities.
 */
import Config from '../config';

const CONFIG = Config.Instance;

export default class Runtime {
  static getConfig = () => {
    return CONFIG;
  };
}
