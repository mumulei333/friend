import { Resource } from "./Interfaces";

export const BUNDLE_REMOTE = "__Remote__Caches__";
export const BUNDLE_RESOURCES = 'resources';

class ResourceCacheData {
    //是否已经加载完成
    isLoaded: boolean = false

    data: cc.Asset | cc.Asset[] = null

    info = new Resource.ResourceInfo()

    status = Resource.ResourceCacheStatus.NONE


    /**@description 在加载过程中有地方获取,加载完成后再回调 */
    getCb: ((data: any) => void)[] = [];

    /**@description 完成回调，在资源正在加载过程中，又有其它地方调用加载同一个资源，此时需要等待资源加载完成，统一回调 */
    finishCb: ((data: any) => void)[] = [];

    public doGet(data) {
        for (let i = 0; i < this.getCb.length; i++) {
            if (this.getCb[i]) this.getCb[i](data);
        }
        this.getCb = [];
    }

    public doFinish(data) {
        for (let i = 0; i < this.finishCb.length; i++) {
            if (this.finishCb[i]) this.finishCb[i](data);
        }
        this.finishCb = [];
    }

    public get isInvalid() {
        return this.isLoaded && this.data && !cc.isValid(this.data);
    }
}
// td.Resource.ResourceCacheData = ResourceCacheData


class ResourceInfo {
    url: string = ""
    type: typeof cc.Asset = null
    data: cc.Asset | cc.Asset[] = null
    retain: boolean = false
    bundle: Resource.BUNDLE_TYPE = null
    resourceType = ResourceType.Local
}
// td.Resource.ResourceInfo = ResourceInfo

/**@description 资源类型 */
enum ResourceType {
    /**@description 本地 */
    Local,
    /**@description 远程资源 */
    Remote,
}
// td.Resource.ResourceType = ResourceType

export enum ResourceCacheStatus {
    /**@description 无状态 */
    NONE,
    /**@description 等待释放 */
    WAITTING_FOR_RELEASE,
}

// td.Resource.ResourceCacheStatus = ResourceCacheStatus