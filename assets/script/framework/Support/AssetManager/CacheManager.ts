import { UIView } from "../Components/UIView";
import { Resource } from "./Interfaces";

/**
 * Create Time
 * 2021-08-19 17:25:11
 */
export class CacheManager {
    private static _instance: any = null;
    public static Instance() { return this._instance || (this._instance = new CacheManager()) }
    private logTag = `[CacheManager]`

    private _bundles = new Map<string, ResourceCache>()
    private _remoteCaches = new RemoteCaches()
    public get remoteCaches() { return this._remoteCaches }

    public getBundleName(bundle: Resource.BUNDLE_TYPE) {
        if (typeof bundle == "string") {
            return bundle
        } else {
            return bundle ? bundle.name : null
        }
    }

    public get(bundle: Resource.BUNDLE_TYPE, path: string, isCheck: boolean = true): Resource.ResourceCacheData {
        let bundleName = this.getBundleName(bundle)
        if (bundleName && this._bundles.has(bundleName)) {
            return this._bundles.get(bundleName).get(path, isCheck)
        }
        return null
    }

    public set(bundle: Resource.BUNDLE_TYPE, path: string, data: Resource.ResourceCacheData) {
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

    /**
 * @description 
 * @param bundle bundle
 * @param path path
 */
    public remove(bundle: Resource.BUNDLE_TYPE, path: string) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName && this._bundles.has(bundleName)) {
            return this._bundles.get(bundleName).remove(path);
        }
        return false;
    }

    public removeWithInfo(info: Resource.ResourceInfo) {
        if (info) {
            if (info.data) {
                if (Array.isArray(info.data)) {
                    let isAllDelete = true;
                    for (let i = 0; i < info.data.length; i++) {
                        info.data[i].decRef();
                        if (info.data[i].refCount != 0) {
                            isAllDelete = false;
                        }
                    }
                    if (isAllDelete) {
                        this.remove(info.bundle, info.url);
                        return true;
                    }
                } else {
                    info.data.decRef();
                    if (info.data.refCount == 0) {
                        this.remove(info.bundle, info.url);
                        return true;
                    }
                }
            } else {
                cc.error(`info.data is null , bundle : ${info.bundle} url : ${info.url}`);
            }
        } else {
            cc.error(`info is null`);
        }
        return false;
    }

    public removeBundle(bundle: Resource.BUNDLE_TYPE) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName && this._bundles.has(bundleName)) {
            if (CC_DEBUG) {
                cc.log(`移除bundle cache : ${bundleName}`)
                let data = this._bundles.get(bundleName);
                this._removeUnuseCaches();
                if (data.size > 0) {
                    cc.error(`移除bundle ${bundleName} 还有未释放的缓存`);
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

    private _getGetCacheByAsyncArgs(): { url: string, type: typeof cc.Asset, bundle: Resource.BUNDLE_TYPE } {
        if (arguments.length < 3) {
            if (CC_DEBUG) cc.error(`${this.logTag}参数传入有误，必须两个参数`);
            return null;
        }
        if (typeof arguments[0] != "string") {
            if (CC_DEBUG) cc.error(`${this.logTag}传入第一个参数有误,必须是string`);
            return null;
        }

        if (!cc.js.isChildClassOf(arguments[1], cc.Asset)) {
            if (CC_DEBUG) cc.error(`${this.logTag}传入的第二个参数有误,必须是cc.Asset的子类`);
            return null;
        }
        return { url: arguments[0], type: arguments[1], bundle: arguments[2] };
    }

    /**
     * @description 如果资源正在加载中，会等待资源加载完成后返回，否则直接返回null
     * @param url 
     * @param type 资源类型
     * @param bundle
     */
    public getCache<T extends cc.Asset>(url: string, type: { prototype: T }, bundle: Resource.BUNDLE_TYPE): Promise<T>;
    public getCache() {
        let args = arguments;
        let me = this;
        return new Promise<any>((resolve) => {
            let _args: { url: string, type: typeof cc.Asset, bundle: Resource.BUNDLE_TYPE } = me._getGetCacheByAsyncArgs.apply(me, args);
            if (!_args) {
                resolve(null);
                return;
            }
            let cache = me.get(_args.bundle, _args.url);
            if (cache) {
                if (cache.isLoaded) {
                    //已经加载完成
                    if (_args.type) {
                        if (cache.data instanceof _args.type) {
                            resolve(cache.data);
                        } else {
                            if (CC_DEBUG) cc.error(`${this.logTag}传入类型:${cc.js.getClassName(_args.type)}与资源实际类型: ${cc.js.getClassName(cache.data)}不同 url : ${cache.info.url}`);
                            resolve(null);
                        }
                    } else {
                        resolve(cache.data);
                    }
                } else {
                    //加载中
                    cache.getCb.push(resolve);
                }
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @description 异步获取资源，如果资源未加载，会加载完成后返回
     * @param url 
     * @param type 
     * @param bundle 
     */
    public getCacheByAsync<T extends cc.Asset>(url: string, type: { prototype: T }, bundle: Resource.BUNDLE_TYPE): Promise<T>;
    public getCacheByAsync() {
        let me = this;
        let args: { url: string, type: typeof cc.Asset, bundle: Resource.BUNDLE_TYPE } = this._getGetCacheByAsyncArgs.apply(this, arguments);
        return new Promise<any>((resolve) => {
            if (!args) {
                resolve(null);
                return;
            }
            me.getCache(args.url, args.type, args.bundle).then((data) => {
                if (data && data instanceof args.type) {
                    resolve(data);
                } else {
                    //加载资源
                    Manager.assetManager.load(args.bundle, args.url, args.type, null, (cache) => {
                        if (cache && cache.data && cache.data instanceof args.type) {
                            resolve(cache.data);
                        } else {
                            cc.error(`${this.logTag}加载失败 : ${args.url}`);
                            resolve(null);
                        }
                    });
                }
            });
        });

    }

    public getSpriteFrameByAsync(urls: string[], key: string, view: UIView, addExtraLoadResource: (view: UIView, info: Resource.ResourceInfo) => void, bundle: Resource.BUNDLE_TYPE) {
        let me = this;
        return new Promise<{ url: string, spriteFrame: cc.SpriteFrame, isTryReload?: boolean }>((resolve) => {
            let nIndex = 0;
            let getFun = (url) => {
                me.getCacheByAsync(url, cc.SpriteAtlas, bundle).then((atlas) => {
                    let info = new Resource.ResourceInfo;
                    info.url = url;
                    info.type = cc.SpriteAtlas;
                    info.data = atlas;
                    info.bundle = bundle;
                    addExtraLoadResource(view, info);
                    if (atlas) {
                        let spriteFrame = atlas.getSpriteFrame(key);
                        if (spriteFrame) {
                            if (cc.isValid(spriteFrame)) {
                                resolve({ url: url, spriteFrame: spriteFrame });
                            } else {
                                //来到这里面，其实程序已经崩溃了，已经没什么意思，也不知道写这个有啥用，尽量安慰,哈哈哈
                                cc.error(`精灵帧被释放，释放当前无法的图集资源 url ：${url} key : ${key}`);
                                Manager.assetManager.releaseAsset(info);
                                resolve({ url: url, spriteFrame: null, isTryReload: true });
                            }
                        } else {
                            nIndex++;
                            if (nIndex >= urls.length) {
                                resolve({ url: url, spriteFrame: null });
                            } else {
                                getFun(urls[nIndex]);
                            }
                        }
                    } else {
                        resolve({ url: url, spriteFrame: null });
                    }
                })
            };

            getFun(urls[nIndex]);
        });
    }

    /**@description 打印当前缓存资源 */
    public printCaches() {
        this._bundles.forEach((value, key, originMap) => {
            if (CC_DEBUG) cc.log(`----------------Bundle ${key} caches begin----------------`)
            value.print();
            if (CC_DEBUG) cc.log(`----------------Bundle ${key} caches end----------------`)
        });

        this.remoteCaches.showCaches();
    }

}

class ResourceCache {
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
            cc.log(`----------- Current valid caches -----------`);
            cc.log(JSON.stringify(content));
        }
        if (invalidContent.length > 0) {
            cc.log(`----------- Current invalid caches -----------`);
            cc.log(JSON.stringify(invalidContent));
        }
    }


    private _caches = new Map<string, Resource.ResourceCacheData>()
    constructor(private name) { }

    public get(path: string, isCheck: boolean): Resource.ResourceCacheData {
        if (this._caches.has(path)) {
            let cache = this._caches.get(path)
            if (isCheck && cache.isInvalid) {
                //资源已经释放
                cc.warn(`资源加载完成，但已经被释放 , 重新加载资源 : ${path}`);
                this.remove(path);
                return null;
            }
            return this._caches.get(path);
        }
        return null;
    }

    public set(path: string, data: Resource.ResourceCacheData) {
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
                    if (CC_DEBUG) cc.log(`删除不使用的资源目录 bundle : ${this.name} dir : ${key}`);
                }
            } else {
                if (value.data && value.data.refCount == 0) {
                    this._caches.delete(key);
                    if (CC_DEBUG) cc.log(`删除不使用的资源 bundle : ${this.name} url : ${key}`);
                }
            }
        });
    }

    public get size() {
        return this._caches.size;
    }
}

class CacheInfo {
    refCount = 0;
    url: string = ""
    /**@description 是否常驻于内存中 */
    retain: boolean = false
}

export class RemoteCaches {
    private _caches = new Map<string, Resource.ResourceCacheData>()
    private _spriteFrameCaches = new Map<string, Resource.ResourceCacheData>()
    private _resMap = new Map<string, CacheInfo>()
    /**
     * @description 获取远程缓存数据
     * @param type 远程奖状类型
     * @param url 远程地址
     */
    public get(url: string) {
        if (this._caches.has(url)) { return this._caches.get(url) }
        return null
    }

    public getSpriteFrame(url: string) {
        if (this._spriteFrameCaches.has(url)) {
            let cache = this._spriteFrameCaches.get(url)
            let texture2D = this.get(url)
            if (texture2D) {
                return cache
            } else {
                this.remove(url)
                return null
            }
        }
        return null;
    }
    public setSpriteFrame(url: string, data: any): cc.SpriteFrame {
        if (data && data instanceof cc.Texture2D) {
            //同一图片加载两次也会回调到这里，这里如果当前精灵缓存中有，不在重新创建
            let spriteFrame = this.getSpriteFrame(url)
            if (spriteFrame) { return <cc.SpriteFrame>(spriteFrame.data) }
            let cache = new Resource.ResourceCacheData()
            cache.data = new cc.SpriteFrame(data)
            cache.isLoaded = true
            cache.info.url = url
            this._spriteFrameCaches.set(url, cache)
            return <cc.SpriteFrame>(cache.data)
        }
        return null;
    }

    public set(url: string, data: Resource.ResourceCacheData) {
        data.info.url = url
        this._caches.set(url, data)
    }

    private _getCacheInfo(info: Resource.ResourceInfo, isNoFoundCreate: boolean = true) {
        if (info && info.url && info.url.length > 0) {
            if (!this._resMap.has(info.url)) {
                if (isNoFoundCreate) {
                    let cache = new CacheInfo
                    cache.url = info.url
                    this._resMap.set(info.url, cache)
                }
                else { return null }
            }
            return this._resMap.get(info.url)
        }
        return null
    }

    public retainAsset(info: Resource.ResourceInfo) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info)
            if (cache) {
                if (cache.retain) {
                    if (!info.retain) {
                        if (CC_DEBUG) cc.warn(`资源 : ${info.url} 已经被设置成常驻资源，不能改变其属性`)
                    }
                } else {
                    cache.retain = info.retain
                }

                (<cc.Asset>info.data).addRef()
                cache.refCount++
                if (cache.retain) {
                    cache.refCount = 999999
                }
            }
        }
    }

    public releaseAsset(info: Resource.ResourceInfo) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info, false)
            if (cache) {
                //常驻内存中
                if (cache.retain) { return }
                cache.refCount--
                if (cache.refCount <= 0) {
                    this.remove(cache.url)
                }
            }
        }
    }

    public remove(url: string) {
        this._resMap.delete(url)

        //先删除精灵帧
        if (this._spriteFrameCaches.has(url)) {
            //先释放引用计数
            (<cc.Asset>this._spriteFrameCaches.get(url).data).decRef()
            this._spriteFrameCaches.delete(url)
            if (CC_DEBUG) cc.log(`remove remote sprite frames resource url : ${url}`)
        }

        let cache = this._caches.has(url) ? this._caches.get(url) : null
        if (cache && cache.data instanceof sp.SkeletonData) {
            //这里面需要删除加载进去的三个文件缓存 
            this.remove(`${cache.info.url}.atlas`)
            this.remove(`${cache.info.url}.png`)
            this.remove(`${cache.info.url}.json`)
        }
        if (cache && cache.data instanceof cc.Asset) {
            if (CC_DEBUG) cc.log(`释放加载的本地远程资源:${cache.info.url}`)
            cache.data.decRef()
            cc.assetManager.releaseAsset(cache.data)
        }
        if (CC_DEBUG) cc.log(`remove remote cache url : ${url}`)
        return this._caches.delete(url)
    }

    showCaches() {
        cc.log(`---- [RemoteCaches] showCaches ----`)

        let content = []
        let invalidContent = []
        this._spriteFrameCaches.forEach((data, key, source) => {
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: cc.isValid(data.data), assetType: cc.js.getClassName(data.info.type), data: data.data ? cc.js.getClassName(data.data) : null, status: data.status }
            let item = { url: key, data: itemContent }
            if (data.isLoaded && ((data.data && !cc.isValid(data.data)) || !data.data)) {
                invalidContent.push(item)
            } else {
                content.push(item)
            }
        });

        if (content.length > 0) {
            cc.log(`----------------Current valid spriteFrame Caches------------------`)
            cc.log(JSON.stringify(content))
        }
        if (invalidContent.length > 0) {
            cc.log(`----------------Current invalid spriteFrame Caches------------------`)
            cc.log(JSON.stringify(invalidContent))
        }


        content = [];
        invalidContent = [];
        this._caches.forEach((data, key, source) => {
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: cc.isValid(data.data), assetType: cc.js.getClassName(data.info.type), data: data.data ? cc.js.getClassName(data.data) : null, status: data.status }
            let item = { url: key, data: itemContent }
            if (data.isLoaded && data.data && !cc.isValid(data.data)) {
                invalidContent.push(item)
            } else {
                content.push(item)
            }
        });
        if (content.length > 0) {
            cc.log(`----------------Current valid Caches------------------`)
            cc.log(JSON.stringify(content))
        }
        if (invalidContent.length > 0) {
            cc.log(`----------------Current invalid Caches------------------`)
            cc.log(JSON.stringify(invalidContent))
        }

        if (this._resMap.size > 0) {
            cc.log(`----------------Current resource reference Caches------------------`)
            content = []
            this._resMap.forEach((value, key) => {
                let item = { url: key, data: { refCount: value.refCount, url: value.url, retain: value.retain } };
                content.push(item)
            })
            cc.log(JSON.stringify(content))
        }
    }
}

// injectWindow(window, "Resource.CacheManager", CacheManager)
// injectWindow(window, "Resource.RemoteCaches", RemoteCaches)