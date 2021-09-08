import { IResource } from "../../Defineds/Interfaces/IResource";

export class ResourceCache {
    print() {
        let content = [];
        let invalidContent = [];
        this._caches.forEach((data, key, source) => {
            let itemContent = {
                url: data.info.url,
                isLoaded: data.isLoaded,
                isValid: cc.isValid(data.data),
                assetType: cc.js.getClassName(data.info.type),
                data: data.data ? cc.js.getClassName(data.data) : null,
                status: data.status
            }
            let item = { url: key, data: itemContent };

            if (data.isLoaded && data.data && !cc.isValid(data.data)) {
                invalidContent.push(item);
            } else {
                content.push(item);
            }
        });
        if (content.length > 0) {
            cc.log("[ResourceCache]", `----------- Current valid caches -----------`);
            cc.log("[ResourceCache]", JSON.stringify(content));
        }
        if (invalidContent.length > 0) {
            cc.log("[ResourceCache]", `----------- Current invalid caches -----------`);
            cc.log("[ResourceCache]", JSON.stringify(invalidContent));
        }
    }


    private _caches = new Map<string, IResource.ResourceCacheData>()
    constructor(private name) { }

    public get(path: string, isCheck: boolean): IResource.ResourceCacheData {
        if (this._caches.has(path)) {
            let cache = this._caches.get(path)
            if (isCheck && cache.isInvalid) {
                //资源已经释放
                cc.warn("[ResourceCache]", `资源加载完成，但已经被释放 , 重新加载资源 : ${path}`);
                this.remove(path);
                return null;
            }
            return this._caches.get(path);
        }
        return null;
    }

    public set(path: string, data: IResource.ResourceCacheData) {
        this._caches.set(path, data);
    }

    public remove(path: string) {
        return this._caches.delete(path);
    }

    public removeUnuseCaches() {
        this._caches.forEach((value, key, origin) => {
            if (Array.isArray(value.data)) {
                let isAllDelete = true;
                for (let i = 0; i < value.data.length; i++) {
                    if (value.data[i] && value.data[i].refCount != 0) {
                        isAllDelete = false;
                    }
                }
                if (isAllDelete) {
                    this._caches.delete(key);
                    if (CC_DEBUG) cc.log("[ResourceCache]", `删除不使用的资源目录 bundle : ${this.name} dir : ${key}`);
                }
            } else {
                if (value.data && value.data.refCount == 0) {
                    this._caches.delete(key);
                    if (CC_DEBUG) cc.log("[ResourceCache]", `删除不使用的资源 bundle : ${this.name} url : ${key}`);
                }
            }
        });
    }

    public get size() {
        return this._caches.size;
    }
}