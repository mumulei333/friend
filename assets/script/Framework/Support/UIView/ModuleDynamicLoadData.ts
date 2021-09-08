import { AssetsManager } from "../Assets/AssetsManager";
import { CacheManager } from "../Assets/CacheManager";
import { IResource } from "../../Defineds/Interfaces/IResource";
import { DYNAMIC_LOAD_GARBAGE } from "./Const";
import { UIManager } from "./UIManager";

export class ModuleDynamicLoadData {
    private _logTag: string = "ModuleDynamicLoadData"
    private local = new Map<string, IResource.ResourceInfo>();
    private remote = new Map<string, IResource.ResourceInfo>();
    public name: string;

    constructor(name: string = null) {
        this.name = name;
    }

    /**@description 添加动态加载的本地资源 */
    public addLocal(info: IResource.ResourceInfo, className: string = null) {
        if (info && info.url) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                cc.error(`[${this._logTag}]`, `找不到资源持有者: ${info.url}`);
            }
            if (CC_DEBUG) UIManager.Instance.checkView(info.url, className);
            if (!this.local.has(info.url)) {
                AssetsManager.Instance.retainAsset(info);
                this.local.set(info.url, info);
            }
        }
    }

    /**@description 添加动态加载的远程资源 */
    public addRemote(info: IResource.ResourceInfo, className: string = null) {
        if (info && info.data && !this.remote.has(info.url)) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                cc.error(`[${this._logTag}]`, `找不到资源持有者 : ${info.url}`);
            }
            if (CC_DEBUG) UIManager.Instance.checkView(info.url, className);
            CacheManager.Instance.remoteCaches.retainAsset(info);
            this.remote.set(info.url, info);
        }
    }

    /**@description 清除远程加载资源 */
    public clear() {
        if (this.name == DYNAMIC_LOAD_GARBAGE) {
            //先输出
            let isShow = this.local.size > 0 || this.remote.size > 0;
            if (isShow) {
                cc.error(`[${this._logTag}]`, `当前未能释放资源如下:`);
            }
            if (this.local && this.local.size > 0) {
                cc.error(`[${this._logTag}]`, "-----------local-----------");
                if (this.local) {
                    this.local.forEach((info) => {
                        cc.error(`[${this._logTag}]`, info.url);
                    });
                }
            }
            if (this.remote && this.remote.size > 0) {
                cc.error(`[${this._logTag}]`, "-----------remote-----------");
                if (this.remote) {
                    this.remote.forEach((info, url) => {
                        cc.error(`[${this._logTag}]`, info.url);
                    });
                }
            }
        } else {
            //先清除当前资源的引用关系
            if (this.local) {
                this.local.forEach((info) => {
                    AssetsManager.Instance.releaseAsset(info);
                });
                this.local.clear();
            }
            if (this.remote) {
                this.remote.forEach((info, url) => {
                    CacheManager.Instance.remoteCaches.releaseAsset(info);
                });
                this.remote.clear();
            }
        }
    }


}