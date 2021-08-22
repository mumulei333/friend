import { UIClass, UIView } from "../Components/UIView";

export namespace Resource {
    export type BUNDLE_TYPE = string | cc.AssetManager.Bundle;

    export enum ResourceType {
        /**@description 本地 */
        Local = 0,
        /**@description 远程资源 */
        Remote = 1
    }

    export enum ResourceCacheStatus {
        /**@description 无状态 */
        NONE = 0,
        /**@description 等待释放 */
        WAITTING_FOR_RELEASE = 1
    }

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

    export interface ResourceData {
        /**@description resources 目录url 与 type 必须成对出现*/
        url?: string,
        /**@description 资源类型 与 url 必须成对出现 目前支持预加载的资源有cc.Prefab | cc.SpriteFrame | sp.SkeletonData*/
        type?: typeof cc.Asset,
        /**
         * @description 预加载界面，不需要对url type赋值 
         * 如GameView游戏界面，需要提前直接加载好界面，而不是只加载预置体，
         * 在网络消息来的时间，用预置体加载界面还是需要一定的时间，
         * 从而会造成消息处理不是顺序执行 
         * */
        preloadView?: UIClass<UIView>,
        bundle?: BUNDLE_TYPE,
        /**@description 如果是加载的目录，请用dir字段 */
        dir?: string,
    }

    export enum ResourceLoaderError {
        /**@description 加载中 */
        LOADING,
        /** @description 未找到或设置加载资源*/
        NO_FOUND_LOAD_RESOURCE,
        /**@description 完美加载 */
        SUCCESS,
    }
}