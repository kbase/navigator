/* eslint-disable camelcase */
import iconData from './icons.json';
import { KBaseServiceClient } from '@kbase/narrative-utils';
import Runtime from '../utils/runtime';

export interface IconInfo {
  icon?: string;
  color: string;
  url?: string;
  isImage: boolean;
}

interface LoadedIconData {
  defaults: { [key: string]: string };
  data: { [key: string]: string };
  colors: Array<string>;
  color_mapping: { [key: string]: string };
}

export enum AppTag {
  release = 'release',
  beta = 'beta',
  dev = 'dev',
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
  private appIconCache: AppIconCache;

  private constructor() {
    // fetch all icon info for types.
    // set up clients to get icons from NMS/Catalog
    this.typeIconInfos = {};
    this.appIconCache = {
      release: {},
      beta: {},
      dev: {},
    };
    this.defaultApp = {
      icon: ICON_DATA.defaults.app,
      color: '#683AB7',
      isImage: false,
    };
    this.defaultType = {
      icon: ICON_DATA.defaults.type,
      color: ICON_DATA.colors[0],
      isImage: false,
    };
    this.processLoadedTypes();
  }

  private processLoadedTypes() {
    Object.keys(ICON_DATA.data).forEach((t) => {
      this.typeIconInfos[t.toLowerCase()] = {
        isImage: false,
        color: ICON_DATA.color_mapping[t],
        icon: ICON_DATA.data[t],
      };
    });
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public typeIcon(objType: string): IconInfo {
    // TODO: this really isn't valid. An object type should always be present,
    // anything else is nonsensical.
    if (!objType) {
      console.warn(
        `[typeIcon] Using default type icon for object type "${objType}"`
      );
      return this.defaultType;
    }
    // TODO: use a regex
    if (objType.includes('.')) {
      objType = objType.split('.')[1];
    }
    if (objType.includes('-')) {
      objType = objType.split('-')[0];
    }
    const lcObjType = objType.toLowerCase();
    return this.typeIconInfos[lcObjType]
      ? this.typeIconInfos[lcObjType]
      : this.defaultType;
  }

  public async appIcon(appId: string, appTag: AppTag): Promise<IconInfo> {
    if (!(appTag in this.appIconCache)) {
      return this.defaultApp;
    }
    if (!this.appIconCache[appTag][appId]) {
      const client = new KBaseServiceClient({
        module: 'NarrativeMethodStore',
        url: Runtime.getConfig().service_routes.narrative_method_store + '/rpc',
      });
      try {
        const methodInfo = await client.call('get_method_brief_info', [
          { ids: [appId], tag: appTag },
        ]);
        const icon = methodInfo[0].icon.url;
        if (!icon) {
          this.appIconCache[appTag][appId] = this.defaultApp;
        } else {
          this.appIconCache[appTag][appId] = {
            isImage: true,
            url: `${
              Runtime.getConfig().service_routes.narrative_method_store
            }/${icon}`,
            color: 'silver',
          };
        }
      } catch {
        this.appIconCache[appTag][appId] = this.defaultApp;
      }
    }
    return this.appIconCache[appTag][appId];
  }
}
