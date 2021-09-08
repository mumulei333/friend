/**
 *
 * @class PackageVersion
 * 子游戏版本管理,在Native环境游戏版本的管理
 */
export class VersionManager {
    private static _instance: VersionManager = null;
    public static get Instance() { return this._instance || (this._instance = new VersionManager()); }

    private _bundleSuffix: string = "Bundle"
    public set setBundleSuffix(val: string) { this._bundleSuffix = val }

    private _entrySuffix: string = "GameEntry"
    public set setEntrySuffix(val: string) { this._entrySuffix = val }


    // private _data: Info_PakcageVersion = null
    private updateUrl: string         //更新地址
    private manifestRoot: string     //默认为manifest
    private main: ISubPackageVersionOption
    private packages: Map<string, ISubPackageVersionOption> = new Map()

    init(dat: string) {
        let obj = null
        try { obj = JSON.parse(dat) }
        catch (e) { throw "[VersionManager] 解析时发生错误 " }
        this._initData(obj)
    }

    private _initData(obj: Info_PakcageVersion) {
        this.updateUrl = obj.updateUrl
        this.manifestRoot = (obj.manifestRoot != "" ? obj.manifestRoot : "manifest")
        this.main = this._checkParam(obj.main)
        for (let i = 0; i < obj.packages.length; i++) {
            let newobj = this._checkParam(obj.packages[i])
            if (!this.packages.has(newobj.name)) {
                this.packages.set(newobj.name, newobj)
            }
        }
    }

    private _checkParam(obj: ISubPackageVersionOption) {
        if (obj == null) { throw "[VersionManager] Cannot be empty " }
        let newObj: ISubPackageVersionOption = {} as any
        Object.assign(newObj, obj)
        if (obj.bundle == null || obj.bundle == "") { newObj.bundle = obj.name + this._bundleSuffix }
        if (obj.entry == null || obj.entry == "") { newObj.entry = obj.name + this._entrySuffix }
        if (obj.isSkip == null) { newObj.isSkip = true }
        if (obj.updateUrl == null || obj.updateUrl == "") { newObj.updateUrl = this.updateUrl }
        if (obj.manifestRoot == null || obj.manifestRoot == "") { newObj.manifestRoot = this.manifestRoot }
        return newObj
    }

    getSubPkgList(): IterableIterator<string> {
        return this.packages.keys()
    }


    getRemoteInfo(key: string = "") {
        this.getSubPkgList().return
        if (key == "" || key == null) {
            return this.main
        } else {
            return this.packages.get(key)
        }
    }
}


export interface ISubPackageVersionOption {
    name: string
    version: string         //远程版本号
    gameName: string        //游戏名
    manifestRoot?: string   //此处为空 会自动使用  Info_PakcageVersion  下的 manifestRoot 为保存地址
    bundle?: string         //此处为空，会自动用name + "Bundle" 去加载bundle
    entry?: string          //此处为空，会自动用name + "GameEntry" 去加载子游戏入口
    updateUrl?: string      //此处为空 会自动使用  Info_PakcageVersion  下的 updateUrl 为更新地址
    isSkip?: boolean        //更新失败时是否可跳过版本更新，默认为false
}

interface Info_PakcageVersion {
    updateUrl: string,         //更新地址
    manifestRoot?: string,     //默认为manifest
    main: ISubPackageVersionOption,
    packages: Array<ISubPackageVersionOption>
}