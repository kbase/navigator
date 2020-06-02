import configFile from '../static/config.json';

interface LoadedConfigFile {
    service_routes: Urls;
    view_routes: Routes;
}

interface Urls {
    search: string;
    workspace: string;
    auth: string;
    user_profile: string;
    narrative_method_store: string;
    catalog: string;
    service_wizard: string;
}

interface Routes {
    narrative: string;
    login: string;
}

const LOADED_CONFIG: LoadedConfigFile = configFile;

export default class Config implements LoadedConfigFile {
    private static _instance: Config;
    public host_root: string;
    public service_root: string;
    public service_routes: Urls;
    public view_routes: Routes;

    private constructor() {
        this.host_root = window._env.host_root; //LOADED_CONFIG.host_root;
        if (this.host_root.endsWith('/')) {
            this.host_root = this.host_root.slice(0, -1);
        }
        this.service_root = window._env.service_root; //LOADED_CONFIG.service_root;
        if (this.service_root.endsWith('/')) {
            this.service_root = this.service_root.slice(0, -1);
        }

        this.service_routes = LOADED_CONFIG.service_routes;
        Object.keys(this.service_routes).forEach(service => {
            let route = this.service_routes[service as keyof Urls];
            if (!route.startsWith('/')) {
                route = '/' + route;
            }
            this.service_routes[service as keyof Urls] = this.service_root + route;
        });

        this.view_routes = LOADED_CONFIG.view_routes;
        Object.keys(this.view_routes).forEach(view => {
            let route = this.view_routes[view as keyof Routes];
            if (!route.startsWith('/')) {
                route = '/' + route;
            }
            this.view_routes[view as keyof Routes] = this.host_root + route;
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
