import { KBaseServiceClient } from '@kbase/narrative-utils';

export interface IDynamicServiceClientOptions {
    moduleName: string,
    wizardUrl: string,
    version?: string,
    authToken?: string
}

export class DynamicServiceClient extends KBaseServiceClient {
    private version: string;
    private dynServUrl: string = '';
    private urlFetchTime: number = 0;
    private maxLifetime: number = 300000;
    private wizardClient: KBaseServiceClient;

    constructor(options: IDynamicServiceClientOptions) {
        super({
            module: options.moduleName,
            url: '',
            authToken: options.authToken || ''
        });
        this.wizardClient = new KBaseServiceClient({
            module: 'ServiceWizard',
            url: options.wizardUrl
        });
        this.version = options.version || 'release';
    }

    private async getServiceUrl(): Promise<string> {
        if (!this.dynServUrl || this.isExpired()) {
            const wizardResponse = await this.wizardClient.call('get_service_status', [{
                module_name: this.module,
                version: this.version
            }]);
            this.dynServUrl = wizardResponse.url;
            this.urlFetchTime = new Date().getTime();
        }
        return this.dynServUrl;
    }

    private isExpired(): boolean {
        const curTime = new Date().getTime();
        return curTime > this.urlFetchTime + this.maxLifetime;
    }

    async call(method: string, params: Array<any>) {
        const servUrl = await this.getServiceUrl();
        this.url = servUrl;
        return super.call(method, params);
    }
}
