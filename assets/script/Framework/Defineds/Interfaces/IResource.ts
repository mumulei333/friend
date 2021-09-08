import { ResourceCacheStatus } from "../Enums/ResourceCacheStatus"
import { ResourceType } from "../Enums/ResourceType"

export namespace IResource {
    export type BUNDLE_TYPE = string | cc.AssetManager.Bundle
    export class ResourceCacheData {
        //是否已经加载完成
        isLoaded: boolean = false

        data: cc.Asset | cc.Asset[] = null

        info: ResourceInfo = new ResourceInfo()
        status: ResourceCacheStatus = ResourceCacheStatus.NONE
        getCb: ((data: any) => void)[] = []
        finishCb: ((data: any) => void)[] = []

        public doGet(data): void {
            for (let i = 0; i < this.getCb.length; i++) {
                if (this.getCb[i]) this.getCb[i](data);
            }
            this.getCb = [];
        }

        public doFinish(data): void {
            for (let i = 0; i < this.finishCb.length; i++) {
                if (this.finishCb[i]) this.finishCb[i](data);
            }
            this.finishCb = [];
        }

        get isInvalid(): boolean { return this.isLoaded && this.data && !cc.isValid(this.data); }
    }

    export class ResourceInfo {
        url: string = ""
        type: typeof cc.Asset = null
        data: cc.Asset | cc.Asset[] = null
        retain: boolean = false
        bundle: BUNDLE_TYPE = null
        resourceType: ResourceType = ResourceType.Local
    }
}