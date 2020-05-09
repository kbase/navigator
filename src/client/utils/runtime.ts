/**
 * A class that provides runtime utilities.
 */

import { getToken } from "./auth";

export class Runtime {
    username = () => window._env.username || undefined;
    token = () => getToken();
}
