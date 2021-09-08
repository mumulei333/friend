import { IResource } from "../../Defineds/Interfaces/IResource";
import { RemoteCaches } from "./RemoteCaches";
import { ResourceCache } from "./ResourceCache";

export class CacheManager {
    private static _instance: CacheManager = null;
    public static get Instance() { return this._instance || (this._instance = new CacheManager()) }

    private _bundles = new Map<string, ResourceCache>()
    private _remoteCaches = new RemoteCaches()
    public get remoteCaches() { return this._remoteCaches }

    removeBundle(bundle: IResource.BUNDLE_TYPE) {
        let bundleName = this.getBundleName(bundle)
        if (bundleName && this._bundles.has(bundleName)) {
            if (CC_DEBUG) {
                cc.log("[CacheManager]", `移除bundle cache : ${bundleName}`)
                let data = this._bundles.get(bundleName);
                this._removeUnuseCaches();
                if (data.size > 0) {
                    cc.error("[CacheManager]", `移除bundle ${bundleName} 还有未释放的缓存`);
                }
            }
            this._bundles.delete(bundleName);
        }
    }

    private _removeUnuseCaches() {
        this._bundles.forEach((value, key, origin) => {
            if (value) {
                value.removeUnuseCaches();
            }
        });
    }

    getBundleName(bundle: IResource.BUNDLE_TYPE) {
        if (typeof bundle == "string") {
            return bundle
        } else {
            return bundle ? bundle.name : null
        }
    }

    public get(bundle: IResource.BUNDLE_TYPE, path: string, isCheck: boolean = true): IResource.ResourceCacheData {
        let bundleName = this.getBundleName(bundle)
        if (bundleName && this._bundles.has(bundleName)) {
            return this._bundles.get(bundleName).get(path, isCheck)
        }
        return null
    }

    public remove(bundle: IResource.BUNDLE_TYPE, path: string): boolean {
        let bundleName = this.getBundleName(bundle)
        if (bundleName && this._bundles.has(bundleName)) {
            return this._bundles.get(bundleName).remove(path)
        }
        return false
    }

    public removeWithInfo(info: IResource.ResourceInfo) {
        let fail = false
        if (!info) {
            cc.error("[CacheManager]", `info is null`)
            return fail
        }
        if (!info.data) {
            cc.error("[CacheManager]", `info.data is null , bundle : ${info.bundle} url : ${info.url}`)
            return fail
        }

        if (Array.isArray(info.data)) {
            let isAllDelete = true
            for (let i = 0; i < info.data.length; i++) {
                info.data[i].decRef()
                if (info.data[i].refCount != 0) { isAllDelete = false }
            }
            if (isAllDelete) {
                this.remove(info.bundle, info.url)
                fail = true
            }
        } else {
            info.data.decRef();
            if (info.data.refCount == 0) {
                this.remove(info.bundle, info.url)
                fail = true
            }
        }


        return fail;
    }

    public set(bundle: IResource.BUNDLE_TYPE, path: string, data: IResource.ResourceCacheData) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName) {
            if (!this._bundles.has(bundleName)) {
                let cache = new ResourceCache(bundleName)
                cache.set(path, data)
                this._bundles.set(bundleName, cache)
            } else {
                this._bundles.get(bundleName).set(path, data)
            }
        }
    }
}






