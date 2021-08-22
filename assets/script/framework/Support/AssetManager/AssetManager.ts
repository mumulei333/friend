import { Resource } from "./Interfaces";
import { RemoteLoader } from "./RemoteLoader";


/**
 * Create Time
 * 2021-08-19 18:08:03
 */
export class AssetManager {
    private static _instance: any = null;
    public static Instance() { return this._instance || (this._instance = new AssetManager()) }
    private logTag = `[AssetManager]`

    private _remote = new RemoteLoader();
    public get remote() { return this._remote; }
    /**
     * @description 获取Bundle
     * @param bundle Bundle名|Bundle
     */
    public getBundle(bundle: Resource.BUNDLE_TYPE) {
        if (bundle) {
            if (typeof bundle == "string") {
                return cc.assetManager.getBundle(bundle);
            }
            return bundle;
        }
        return null;
    }

    /**@description 加载bundle */
    public loadBundle(nameOrUrl: string, onComplete: (err: Error, bundle: cc.AssetManager.Bundle) => void): void {
        cc.assetManager.loadBundle(nameOrUrl, onComplete);
    }

    /**@description 移除bundle */
    public removeBundle(bundle: Resource.BUNDLE_TYPE) {
        let result = this.getBundle(bundle);
        if (result) {
            Manager.cacheManager.removeBundle(bundle);
            result.releaseAll();
            cc.assetManager.removeBundle(result);
        }
    }

    public load(
        bundle: Resource.BUNDLE_TYPE,
        path: string,
        type: typeof cc.Asset,
        onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void,
        onComplete: (data: Resource.ResourceCacheData) => void): void {
        if (CC_DEBUG) {
            cc.log(`load bundle : ${bundle} path : ${path}`)
        }
        let cache = Manager.cacheManager.get(bundle, path);
        if (cache) {
            //存在缓存信息
            if (cache.isLoaded) {
                //已经加载完成
                if (CC_DEBUG && cache.status == Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE) {
                    cc.warn(this.logTag, `资源:${path} 等待释放，但资源已经加载完成，此时有人又重新加载，不进行释放处理`);
                }
                //加载完成
                onComplete(cache);
            } else {
                if (CC_DEBUG && cache.status == Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE) {
                    cc.warn(this.logTag, `资源:${path}等待释放，但资源处理加载过程中，此时有人又重新加载，不进行释放处理`);
                }
                cache.finishCb.push(onComplete);
            }
            //重新复位资源状态
            cache.status = Resource.ResourceCacheStatus.NONE;
        } else {
            //无缓存信息
            cache = new Resource.ResourceCacheData();
            cache.info.url = path;
            cache.info.type = type;
            cache.info.bundle = bundle;
            Manager.cacheManager.set(bundle, path, cache);
            cc.time(`加载资源 : ${cache.info.url}`);
            let _bundle = this.getBundle(bundle);
            if (!_bundle) {
                //如果bundle不存在
                let error = new Error(`${this.logTag} ${bundle} 没有加载，请先加载`);
                this._onLoadComplete(cache, onComplete, error, null);
                return;
            }
            let res = _bundle.get(path, type);
            if (res) {
                this._onLoadComplete(cache, onComplete, null, res);
            } else {
                if (onProgress) {
                    _bundle.load(path, type, onProgress, this._onLoadComplete.bind(this, cache, onComplete));
                } else {
                    _bundle.load(path, type, this._onLoadComplete.bind(this, cache, onComplete));
                }
            }
        }
    }

    private _onLoadComplete(cache: Resource.ResourceCacheData, completeCallback: (data: Resource.ResourceCacheData) => void, err: Error, data: cc.Asset | cc.Asset[]) {
        cache.isLoaded = true;
        //添加引用关系
        let tempCache = cache;
        if (err) {
            cc.error(`${this.logTag}加载资源失败:${cache.info.url} 原因:${err.message ? err.message : "未知"}`);
            cache.data = null;
            tempCache.data = null;
            Manager.cacheManager.remove(cache.info.bundle, cache.info.url);
            completeCallback(cache);
        }
        else {
            if (CC_DEBUG) cc.log(`${this.logTag}加载资源成功:${cache.info.url}`);
            cache.data = data;
            tempCache.data = data;
            completeCallback(cache);
        }

        //加载过程，有不同地方调用过来加载同一个资源的地方，都回调回去
        cache.doFinish(tempCache);
        cache.doGet(tempCache.data);

        if (cache.status == Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE) {
            if (CC_DEBUG) cc.warn(this.logTag, `资源:${cache.info.url}加载完成，但缓存状态为等待销毁，销毁资源`);
            if (cache.data) {
                cache.status = Resource.ResourceCacheStatus.NONE;
                let info = new Resource.ResourceInfo;
                info.url = cache.info.url;
                info.type = cache.info.type;
                info.data = cache.data;
                info.bundle = cache.info.bundle;
                this.releaseAsset(info);
            }
        }

        cc.timeEnd(`加载资源 : ${cache.info.url}`);
    }

    public loadDir(
        bundle: Resource.BUNDLE_TYPE,
        path: string,
        type: typeof cc.Asset,
        onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void,
        onComplete: (data: Resource.ResourceCacheData) => void): void {
        if (CC_DEBUG) {
            cc.log(`load bundle : ${bundle} path : ${path}`)
        }
        let cache = Manager.cacheManager.get(bundle, path);
        if (cache) {
            //存在缓存信息
            if (cache.isLoaded) {
                //已经加载完成
                if (CC_DEBUG && cache.status == Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE) {
                    cc.warn(this.logTag, `资源:${path} 等待释放，但资源已经加载完成，此时有人又重新加载，不进行释放处理`);
                }
                //加载完成
                onComplete(cache);
            } else {
                if (CC_DEBUG && cache.status == Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE) {
                    cc.warn(this.logTag, `资源:${path}等待释放，但资源处理加载过程中，此时有人又重新加载，不进行释放处理`);
                }
                cache.finishCb.push(onComplete);
            }
            //重新复位资源状态
            cache.status = Resource.ResourceCacheStatus.NONE;
        } else {
            //无缓存信息
            cache = new Resource.ResourceCacheData();
            cache.info.url = path;
            cache.info.type = type;
            cache.info.bundle = bundle;
            Manager.cacheManager.set(bundle, path, cache);
            cc.time(`加载资源 : ${cache.info.url}`);
            let _bundle = this.getBundle(bundle);
            if (!_bundle) {
                //如果bundle不存在
                let error = new Error(`${this.logTag} ${bundle} 没有加载，请先加载`);
                this._onLoadComplete(cache, onComplete, error, null);
                return;
            }
            if (onProgress) {
                _bundle.loadDir(path, type, onProgress, this._onLoadComplete.bind(this, cache, onComplete));
            } else {
                _bundle.loadDir(path, type, this._onLoadComplete.bind(this, cache, onComplete));
            }
        }
    }

    public releaseAsset(info: Resource.ResourceInfo) {
        if (info && info.bundle) {
            let cache = Manager.cacheManager.get(info.bundle, info.url, false);
            if (!cache) {
                return;
            } else {
                if (cache.isInvalid) {
                    if (CC_DEBUG) cc.warn(`资源已经释放 url : ${info.url}`);
                    return;
                }
            }
            if (cache.isLoaded) {
                if (cache.info.retain) {
                    if (CC_DEBUG) cc.log(`常驻资源 url : ${cache.info.url}`);
                    return;
                }
                if (CC_DEBUG) cc.log(`释放资源 : ${info.bundle}.${info.url}`);

                if (Manager.cacheManager.removeWithInfo(info)) {
                    let bundle = this.getBundle(info.bundle);
                    if (bundle) {
                        if (Array.isArray(info.data)) {
                            for (let i = 0; i < info.data.length; i++) {
                                let path = `${info.url}/${info.data[i].name}`;
                                bundle.release(path, info.type);
                            }
                            if (CC_DEBUG) cc.log(`成功释放资源目录 : ${info.bundle}.${info.url}`);
                        } else {
                            bundle.release(info.url, info.type);
                            if (CC_DEBUG) cc.log(`成功释放资源 : ${info.bundle}.${info.url}`);
                        }
                    } else {
                        cc.error(`${info.bundle} no found`);
                    }
                } else {
                    if (CC_DEBUG) {
                        if (Array.isArray(info.data)) {
                            for (let i = 0; i < info.data.length; i++) {
                                if (info.data[i].refCount != 0) {
                                    cc.warn(`资源bundle : ${info.bundle} url : ${info.url}/${info.data[i].name} 被其它界面引用 refCount : ${info.data[i].refCount}`)
                                }
                            }
                        } else {
                            cc.warn(`资源bundle : ${info.bundle} url : ${info.url} 被其它界面引用 refCount : ${info.data.refCount}`)
                        }
                    }
                }
            } else {
                cache.status = Resource.ResourceCacheStatus.WAITTING_FOR_RELEASE;
                if (CC_DEBUG) cc.warn(`${cache.info.url} 正在加载，等待加载完成后进行释放`);
            }

        }
    }

    public retainAsset(info: Resource.ResourceInfo) {
        if (info) {
            let cache = Manager.cacheManager.get(info.bundle, info.url)
            if (cache) {
                if (CC_DEBUG) {
                    if (info.data != cache.data) {
                        cc.error(`错误的retainAsset :${info.url}`);
                    }
                }
                if (!cache.info.retain) {
                    cache.info.retain = info.retain;
                }
                if (Array.isArray(cache.data)) {
                    //里面是数组 
                    for (let i = 0; i < cache.data.length; i++) {
                        cache.data[i] && cache.data[i].addRef();
                    }
                } else {
                    cache.data && cache.data.addRef();
                }
            } else {
                if (CC_DEBUG) cc.error(`retainAsset cache.data is null`);
            }
        } else {
            if (CC_DEBUG) cc.error(`retainAsset info is null`);
        }
    }

    /**
     * @description 添加常驻资源
     * @param prefab 
     */
    public addPersistAsset(url: string, data: cc.Asset, bundle: Resource.BUNDLE_TYPE) {
        let info = new Resource.ResourceInfo;
        info.url = url;
        info.data = data;
        info.bundle = bundle;
        info.retain = true;
        this.retainAsset(info);
    }
}
// injectWindow(window, "AssetManager", AssetManager)