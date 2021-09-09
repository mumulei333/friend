import { IResource } from "../../Defineds/Interfaces/IResource"
import { getClassName } from "../../Extentions/getClassName";

class CacheInfo {
    refCount = 0;
    url: string = ""
    /**@description 是否常驻于内存中 */
    retain: boolean = false
}

export class RemoteCaches {
    private _caches = new Map<string, IResource.ResourceCacheData>()
    private _spriteFrameCaches = new Map<string, IResource.ResourceCacheData>()
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


    public getBundleName(bundle: IResource.BUNDLE_TYPE) {
        if (typeof bundle == "string") {
            return bundle
        } else {
            return bundle ? bundle.name : null
        }
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
            let cache = new IResource.ResourceCacheData()
            cache.data = new cc.SpriteFrame(data)
            cache.isLoaded = true
            cache.info.url = url
            this._spriteFrameCaches.set(url, cache)
            return <cc.SpriteFrame>(cache.data)
        }
        return null;
    }

    public set(url: string, data: IResource.ResourceCacheData) {
        data.info.url = url
        this._caches.set(url, data)
    }

    private _getCacheInfo(info: IResource.ResourceInfo, isNoFoundCreate: boolean = true) {
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

    public retainAsset(info: IResource.ResourceInfo) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info)
            if (cache) {
                if (cache.retain) {
                    if (!info.retain) {
                        if (CC_DEBUG) cc.warn("[RemoteCaches]", `资源 : ${info.url} 已经被设置成常驻资源，不能改变其属性`)
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

    public releaseAsset(info: IResource.ResourceInfo) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info, false)
            if (cache) {
                //常驻内存中
                if (cache.retain) { return }
                cache.refCount--
                if (cache.refCount <= 0) { this.remove(cache.url) }
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
            if (CC_DEBUG) cc.log("[RemoteCaches]", `remove remote sprite frames resource url : ${url}`)
        }

        let cache = this._caches.has(url) ? this._caches.get(url) : null
        if (cache && cache.data instanceof sp.SkeletonData) {
            //这里面需要删除加载进去的三个文件缓存 
            this.remove(`${cache.info.url}.atlas`)
            this.remove(`${cache.info.url}.png`)
            this.remove(`${cache.info.url}.json`)
        }
        if (cache && cache.data instanceof cc.Asset) {
            if (CC_DEBUG) cc.log("[RemoteCaches]", `释放加载的本地远程资源:${cache.info.url}`)
            cache.data.decRef()
            cc.assetManager.releaseAsset(cache.data)
        }
        if (CC_DEBUG) cc.log("[RemoteCaches]", `remove remote cache url : ${url}`)
        return this._caches.delete(url)
    }

    showCaches() {
        cc.log(`---- [RemoteCaches] showCaches ----`)
        let content = []
        let invalidContent = []
        this._spriteFrameCaches.forEach((data, key, source) => {
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: cc.isValid(data.data), assetType: getClassName(data.info.type), data: data.data ? getClassName(data.data) : null, status: data.status }
            let item = { url: key, data: itemContent }
            if (data.isLoaded && ((data.data && !cc.isValid(data.data)) || !data.data)) {
                invalidContent.push(item)
            } else { content.push(item) }
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
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: cc.isValid(data.data), assetType: getClassName(data.info.type), data: data.data ? getClassName(data.data) : null, status: data.status }
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