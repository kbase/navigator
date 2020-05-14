import iconData from './icons.json';

export interface IconInfo {
    icon?: string;
    color: string;
    url?: string;
    isImage: boolean;
}

interface LoadedIconData {
    defaults: {[key: string]: string},
    data: {[key: string]: string},
    colors: Array<string>,
    color_mapping: {[key: string]: string}
}

enum AppTag {
    release = 'release',
    beta = 'beta',
    dev = 'dev'
}

interface AppIconCache {
    release: { [key: string]: IconInfo };
    beta: { [key: string]: IconInfo };
    dev: { [key: string]: IconInfo };
}
const ICON_DATA: LoadedIconData = iconData;

export default class IconProvider {
    private static _instance: IconProvider;
    private typeIconInfos: { [key: string]: IconInfo };
    private defaultApp: IconInfo;
    private defaultType: IconInfo;
    // appIconCache - {
    //     release: {
    //         appId1: IconInfo,
    //         appId2: IconInfo,
    //     },
    //     beta, {
    //         appId1: IconInfo
    //     }
    // }
    private appIconCache: AppIconCache;

    private constructor() {
        // fetch all icon info for types.
        // set up clients to get icons from NMS/Catalog
        this.typeIconInfos = {};
        this.appIconCache = {
            release: {},
            beta: {},
            dev: {}
        };
        this.defaultApp = {
            icon: ICON_DATA.defaults.app,
            color: ICON_DATA.colors[0],
            isImage: false
        };
        this.defaultType = {
            icon: ICON_DATA.defaults.type,
            color: ICON_DATA.colors[0],
            isImage: false
        };
        this.processLoadedTypes();
    }

    private processLoadedTypes() {
        Object.keys(ICON_DATA.data).forEach(t => {
            this.typeIconInfos[t.toLowerCase()] = {
                isImage: false,
                color: ICON_DATA.color_mapping[t],
                icon: ICON_DATA.data[t]
            }
        })
    }


    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public typeIcon(objType: string): IconInfo {
        if (objType.includes('.')) {
            objType = objType.split('.')[1];
        }
        if (objType.includes('-')) {
            objType = objType.split('-')[0];
        }
        const lcObjType = objType.toLowerCase();
        return this.typeIconInfos[lcObjType] ? this.typeIconInfos[lcObjType] : this.defaultType;
    }

    public appIcon(appId: string, appTag: AppTag): IconInfo {
        if (!(appTag in this.appIconCache)) {
            return this.defaultApp;
        }
        if (!this.appIconCache[appTag][appId]) {
            // go fetch it
            return this.defaultApp;
        }
        return this.appIconCache[appTag][appId];
    }
}
