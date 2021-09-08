import { Macro } from "../../Config/Macro";
import { ResourceType } from "../../Defineds/Enums/ResourceType";
import { IResource } from "../../Defineds/Interfaces/IResource";
import { CacheManager } from "./CacheManager";

export class RemoteLoader {

    private _logTag = `[RemoteLoader] `;
    private static _instance: RemoteLoader = null;
    public static get Instance() { return this._instance || (this._instance = new RemoteLoader()); }

    public loadImage(url: string, isNeedCache: boolean) {
        let me = this;
        return new Promise<cc.SpriteFrame>((resolve) => {
            if (url == null || url == undefined || url.length <= 0) {
                resolve(null);
                return;
            }
            if (isNeedCache) {
                //如果存在缓存 ，直接取出
                let spCache = CacheManager.Instance.remoteCaches.getSpriteFrame(url);
                if (spCache && spCache.data) {
                    if (CC_DEBUG) cc.log(this._logTag, `从缓存精灵帧中获取:${url}`);
                    resolve(<cc.SpriteFrame>(spCache.data));
                    return;
                } else {
                    //错误处理
                    if (CC_DEBUG) cc.log(this._logTag, `错误资源，删除缓存信息，重新加载:${url}`);
                    CacheManager.Instance.remoteCaches.remove(url);
                }
            } else {
                //不需要缓存，先删除之前的,再重新加载
                if (CC_DEBUG) cc.log(this._logTag, `不需要缓存信息，删除缓存，重新加载${url}`);
                CacheManager.Instance.remoteCaches.remove(url);
            }

            me._loadRemoteRes(url, cc.Texture2D, isNeedCache).then((data: any) => {
                //改变缓存类型
                let cache = CacheManager.Instance.remoteCaches.get(url);
                if (data && cache) {
                    if (CC_DEBUG) cc.log(`${this._logTag}加载图片完成${url}`);
                    cache.data = data;
                    (<cc.Asset>cache.data).name = url;
                    let spriteFrame = CacheManager.Instance.remoteCaches.setSpriteFrame(url, cache.data);
                    resolve(spriteFrame);
                } else {
                    if (CC_DEBUG) cc.warn(`${this._logTag}加载图片错误${url}`);
                    resolve(null);
                }
            })
        });
    }

    public loadSkeleton(path: string, name: string, isNeedCache: boolean) {
        let me = this;
        return new Promise<sp.SkeletonData>((resolve) => {
            if (path && name) {
                let url = `${path}/${name}`;
                let spineAtlas = `${path}/${name}.atlas`;
                let spinePng = `${path}/${name}.png`;
                let spineJson = `${path}/${name}.json`;
                let cache = CacheManager.Instance.remoteCaches.get(url);
                if (cache) {
                    if (cache.isLoaded) {
                        resolve(<sp.SkeletonData>(cache.data));
                    } else {
                        cache.finishCb.push(resolve);
                    }
                } else {
                    cache = new IResource.ResourceCacheData();
                    cache.info.resourceType = ResourceType.Remote;
                    cache.info.type = sp.SkeletonData;
                    cache.info.bundle = Macro.BUNDLE_REMOTE;
                    CacheManager.Instance.remoteCaches.set(url, cache);
                    me._loadRemoteRes(spinePng, cc.Texture2D, isNeedCache).then((texture: cc.Texture2D) => {
                        if (texture) {
                            me._loadRemoteRes(spineJson, cc.JsonAsset, isNeedCache).then((json: cc.JsonAsset) => {
                                if (json) {
                                    me._loadRemoteRes(spineAtlas, cc.JsonAsset, isNeedCache).then((atlas: cc.TextAsset) => {
                                        if (atlas) {
                                            //生成SkeletonData数据
                                            let asset = new sp.SkeletonData;
                                            asset.skeletonJson = json.json;
                                            asset.atlasText = atlas.text;
                                            asset.textures = [texture];
                                            let pngName = name + ".png"
                                            asset["textureNames"] = [pngName];

                                            cache.info.url = url;
                                            asset.name = url;
                                            cache.data = asset;
                                            cache.isLoaded = true;
                                            resolve(<sp.SkeletonData>(cache.data));
                                            cache.doFinish(cache.data);
                                        } else {
                                            resolve(null);
                                            cache.doFinish(null);
                                            CacheManager.Instance.remoteCaches.remove(url);
                                        }
                                    });
                                } else {
                                    resolve(null);
                                    cache.doFinish(null);
                                    CacheManager.Instance.remoteCaches.remove(url);
                                }
                            });
                        } else {
                            resolve(null);
                            cache.doFinish(null);
                            CacheManager.Instance.remoteCaches.remove(url);
                        }
                    })
                }
            } else {
                resolve(null);
            }
        });
    }

    private _loadRemoteRes(url: string, type: typeof cc.Asset, isNeedCache: boolean) {
        return new Promise<any>((resolve) => {
            let cache = CacheManager.Instance.remoteCaches.get(url);
            if (cache) {
                //有缓存,查看是否已经加载
                if (cache.isLoaded) {
                    //如果已经加载完成
                    resolve(cache.data);
                } else {
                    //正在加载中
                    cache.finishCb.push(resolve);
                }
            } else {
                //没有缓存存在,生成加载缓存
                cache = new IResource.ResourceCacheData();
                cache.info.resourceType = ResourceType.Remote;
                cache.info.type = type;
                CacheManager.Instance.remoteCaches.set(url, cache);
                cc.assetManager.loadRemote(url, (error, data) => {
                    cache.isLoaded = true;
                    if (data) {
                        cache.data = data;
                        (<cc.Asset>cache.data).addRef();
                        if (CC_DEBUG) cc.log(`${this._logTag}加载远程资源完成:${url}`);
                    }
                    else {
                        if (CC_DEBUG) cc.warn(`${this._logTag}加载本地资源异常:${url}`);
                    }
                    //把再加载过程里，双加载同一资源的回调都回调回去
                    cache.doFinish(data);
                    resolve(cache.data)
                })
            }
        });
    }

    /**@description 由主游戏控制器驱动，在下载远程资源时，设置一个上限下载任务数据，以免同一时间任务数量过大 */
    update() {

    }
}

