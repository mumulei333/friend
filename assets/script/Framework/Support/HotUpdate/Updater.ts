import { HotUpdateEnums } from "../../Defineds/Enums/HotUpdateEnums";
import { EUpdater } from "../../Defineds/Events/EUpdater";
import { IUpdater } from "../../Defineds/Interfaces/IUpdater";
import { EventManager } from "../Event/EventManager";

export class Updater {
    private updating = false
    private curAssetsManager: AssetsManager = null
    private storagePath: string = ""

    constructor(private option: IUpdater.UpdaterOption, private _updateCallback, private onCompolete: Function /** 更新完成 */,) {
        if (this.option != null && this.option.name == "") { this.option.name = "MainPackage" }
        this.initAssetsManager()
    }

    private initAssetsManager() {
        if (this._isNeedUpdate(this._updateCallback)) {
            this.curAssetsManager = this._getAssetsManager()
            // this.currentAssetsManager.manager.loadLocalManifest();
            this.localFileExist()
            // this.checkUpdate()
        }
    }

    private localFileExist() {
        let manifestUrl = this.option.isMain ? this._getMainfestUrl : this._getSubMainfestUrl
        if (jsb.fileUtils.isFileExist(manifestUrl)) {
            let content = jsb.fileUtils.getStringFromFile(manifestUrl)
            //@ts-ignore
            let jsbGameManifest = new jsb.Manifest(content, this.storagePath, this.option.updateAddress);
            console.log(`[${this.option.name}_Updater]`, `--存在本地版本控制文件checkUpdate--`);
            console.log(`[${this.option.name}_Updater]`, `mainifestUrl : ${manifestUrl}`);
            this.curAssetsManager.manager.loadLocalManifest(jsbGameManifest, "");
        } else {
            if (this.updating) {
                console.log(`[${this.option.name}_Updater]`, `Checking or updating...`);
                this._updateCallback(HotUpdateEnums.Code.CHECKING, HotUpdateEnums.State.PREDOWNLOAD_VERSION);
                return;
            }
            let packageUrl = this.option.updateAddress
            let gameManifest = {
                version: "0",
                packageUrl: packageUrl,
                remoteManifestUrl: `${packageUrl}/${manifestUrl}`,
                remoteVersionUrl: `${packageUrl}/${this.option.manifestRoot}/${this.option.name}_version.manifest`,
                assets: {},
                searchPaths: []
            }
            let gameManifestContent = JSON.stringify(gameManifest);
            //@ts-ignore
            let jsbGameManifest = new jsb.Manifest(gameManifestContent, this.storagePath, this.option.updateAddress);
            console.log(`[${this.option.name}_Updater]`, `--checkUpdate--`);
            console.log(`[${this.option.name}_Updater]`, `mainifest content : ${gameManifestContent}`);
            this.curAssetsManager.manager.loadLocalManifest(jsbGameManifest, "");
            this.checkUpdate();
        }
        this.checkUpdate();
    }

    private get _getMainfestUrl() { return `${this.option.manifestRoot}/project.manifest` }
    private get _getSubMainfestUrl() { return `${this.option.manifestRoot}/${this.option.name}_project.manifest` }


    /**@description 获取资源管理器 */
    private _getAssetsManager() {
        if (CC_JSB) {
            this.storagePath = jsb.fileUtils.getWritablePath()
            console.log(`[${this.option.name}_Updater]`, `Storage path for remote asset:${this.storagePath}`);
            let am = new AssetsManager(this.option.name)
            am.manager = new jsb.AssetsManager(this.option.isMain ? "type.hall" : `type.${this.option.name}_`, this.storagePath, this.versionCompareHanle.bind(this))
            //@ts-ignore
            am.manager.setMaxConcurrentTask(8);
            //@ts-ignore
            am.manager.setHotUpdateUrl(this.option.updateAddress);
            am.manager.setVerifyCallback((path, asset) => {
                let compressed = asset.compressed;
                let expectedMD5 = asset.md5;
                let relativePath = asset.path;
                let size = asset.size;
                if (compressed) {
                    console.log(`[${this.option.name}_Updater]`, `Verification passed : ${relativePath}`);
                    return true;
                }
                else {
                    console.log(`[${this.option.name}_Updater]`, `Verification passed : ${relativePath} ( ${expectedMD5} )`);
                    return true;
                }
            })
            return am
        }
    }

    private get isBrowser() {
        return cc.sys.platform == cc.sys.WECHAT_GAME || CC_PREVIEW || cc.sys.isBrowser;
    }

    //检查更新
    private checkUpdate() {
        if (this._isNeedUpdate(this._updateCallback)) {
            console.log(`[${this.option.name}_Updater]`, "checkUpdate")
            if (this.updating) {
                console.log(`[${this.option.name}_Updater]`, `Checking or updating...`);
                this._updateCallback(HotUpdateEnums.Code.CHECKING, HotUpdateEnums.State.PREDOWNLOAD_VERSION);
                return;
            }
            if (!this.curAssetsManager.manager.getLocalManifest() || !this.curAssetsManager.manager.getLocalManifest().isLoaded()) {
                console.log(`[${this.option.name}_Updater]`, `Failed to load local manifest ....`);
                this._updateCallback(HotUpdateEnums.Code.ERROR_DOWNLOAD_MANIFEST, HotUpdateEnums.State.FAIL_TO_UPDATE);
                return;
            }
            if (this.isTryDownloadFailedAssets()) {
                //已经更新失败，尝试获取更新下载失败的
                console.log(`[${this.option.name}_Updater]`, `之前下载资源未完全下载完成，请尝试重新下载`);
                this._updateCallback(HotUpdateEnums.Code.UPDATE_FAILED, HotUpdateEnums.State.TRY_DOWNLOAD_FAILED_ASSETS);
            } else {
                this.updating = true;
                this.curAssetsManager.manager.setEventCallback(this.checkCb.bind(this));
                this.curAssetsManager.manager.checkUpdate();
            }
        }
    }

    /**@description 判断是否需要重新尝试下载之前下载失败的文件 */
    private isTryDownloadFailedAssets() {
        if (this.curAssetsManager && (
            this.curAssetsManager.manager.getState() == HotUpdateEnums.State.FAIL_TO_UPDATE as number ||
            this.curAssetsManager.code == HotUpdateEnums.Code.ERROR_NO_LOCAL_MANIFEST ||
            this.curAssetsManager.code == HotUpdateEnums.Code.ERROR_DOWNLOAD_MANIFEST ||
            this.curAssetsManager.code == HotUpdateEnums.Code.ERROR_PARSE_MANIFEST)
        ) {
            return true;
        }
        return false;
    }

    private _isNeedUpdate(callback: IUpdater.updateCallback) {
        if (this.isBrowser) {
            this.updating = false
            callback(HotUpdateEnums.Code.ALREADY_UP_TO_DATE, HotUpdateEnums.State.UP_TO_DATE);
            return false;
        } else {
            if (this.option.isSkip) {
                console.log(`[${this.option.name}_Updater]`, "跳过热更新，直接使用本地资源代码");
                this.updating = false;
                callback(HotUpdateEnums.Code.ALREADY_UP_TO_DATE, HotUpdateEnums.State.UP_TO_DATE);
            }
            return !this.option.isSkip;
        }
    }

    /**@description 检测更新 */
    private checkCb(event) {
        //这里不能置空，下载manifest文件也会回调过来
        //this.checkCallback = null;
        //存储当前的状态，当下载版本文件失败时，state的状态与下载非版本文件是一样的状态
        this.curAssetsManager.code = event.getEventCode();
        console.log(`[${this.option.name}_Updater]`, `checkCb event code : ${event.getEventCode()} state : ${this.curAssetsManager.manager.getState()}`);
        switch (event.getEventCode()) {
            case HotUpdateEnums.Code.ERROR_NO_LOCAL_MANIFEST:
                console.log(`[${this.option.name}_Updater]`, `No local manifest file found, hot update skipped.`);
                break;
            case HotUpdateEnums.Code.ERROR_DOWNLOAD_MANIFEST:
            case HotUpdateEnums.Code.ERROR_PARSE_MANIFEST:
                console.log(`[${this.option.name}_Updater]`, `Fail to download manifest file, hot update skipped.`);
                break;
            case HotUpdateEnums.Code.ALREADY_UP_TO_DATE:
                console.log(`[${this.option.name}_Updater]`, `Already up to date with the latest remote version.`);
                break;
            case HotUpdateEnums.Code.NEW_VERSION_FOUND:
                console.log(`[${this.option.name}_Updater]`, `New version found, please try to update.`);
                break;
            default:
                return;
        }

        //this.currentAssetsManager.setEventCallback(null);
        this.updating = false;

        //如果正在下载更新文件，先下载更新文件比较完成后，再回调
        if (this._updateCallback && this.curAssetsManager.manager.getState() != HotUpdateEnums.State.DOWNLOADING_VERSION as number) {
            this._updateCallback(event.getEventCode(), this.curAssetsManager.manager.getState() as number);
            this._updateCallback = null;
        }
    }

    downloadFailedAssets() {
        if (this.curAssetsManager) {
            this.curAssetsManager.manager.downloadFailedAssets();
        }
    }

    private versionCompareHanle(versionA: string, versionB: string) {
        console.log(`[${this.option.name}_Updater]`, `JS Custom Version Compare : version A is ${versionA} , version B is ${versionB}`);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        console.log(`[${this.option.name}_Updater]`, `version A ${vA} , version B ${vB}`);
        for (let i = 0; i < vA.length && i < vB.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i]);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        return 0;
    }

    //开始热更新
    public runHotUpdate() {
        if (!this.curAssetsManager) {
            cc.error(`[${this.option.name}_Updater]`, `热更新器未初始化`);
            return;
        }
        console.log(`即将热更新模块为:${this.option.name} , updating : ${this.updating}`);
        if (!this.updating) {
            console.log(`[${this.option.name}_Updater]`, `执行更新 ${this.curAssetsManager.name} `);
            this.curAssetsManager.manager.setEventCallback(this.updateCb.bind(this));
            this.curAssetsManager.manager.update();
        }
    }

    /**@description 热更新回调 */
    private updateCb(event) {
        var isUpdateFinished = false;
        var failed = false;
        console.log(`[${this.option.name}_Updater]`, `--update cb code : ${event.getEventCode()} state : ${this.curAssetsManager.manager.getState()}`);
        //存储当前的状态，当下载版本文件失败时，state的状态与下载非版本文件是一样的状态
        this.curAssetsManager.code = event.getEventCode();
        switch (event.getEventCode()) {
            case HotUpdateEnums.Code.ERROR_NO_LOCAL_MANIFEST:
                console.log(`[${this.option.name}_Updater]`, `No local manifest file found, hot update skipped.`);
                failed = true;
                break;
            case HotUpdateEnums.Code.UPDATE_PROGRESSION:
                console.log(`[${this.option.name}_Updater]`, `${event.getDownloadedBytes()} / ${event.getTotalBytes()}`);
                console.log(`[${this.option.name}_Updater]`, `${event.getDownloadedFiles()} / ${event.getTotalFiles()}`);
                console.log(`[${this.option.name}_Updater]`, `percent : ${event.getPercent()}`);
                console.log(`[${this.option.name}_Updater]`, `percent by file : ${event.getPercentByFile()}`);
                var msg = event.getMessage();
                if (msg) {
                    console.log(`[${this.option.name}_Updater]`, `Updated file: ${msg}`);
                }
                break;
            case HotUpdateEnums.Code.ERROR_DOWNLOAD_MANIFEST:
            case HotUpdateEnums.Code.ERROR_PARSE_MANIFEST:
                console.log(`[${this.option.name}_Updater]`, `Fail to download manifest file, hot update skipped.`);
                failed = true;
                break;
            case HotUpdateEnums.Code.ALREADY_UP_TO_DATE:
                console.log(`[${this.option.name}_Updater]`, `Already up to date with the latest remote version.`);
                failed = true;
                break;
            case HotUpdateEnums.Code.UPDATE_FINISHED:
                console.log(`[${this.option.name}_Updater]`, `Update finished. ${event.getMessage()}`);
                isUpdateFinished = true;
                break;
            case HotUpdateEnums.Code.UPDATE_FAILED:
                console.log(`[${this.option.name}_Updater]`, `Update failed. ${event.getMessage()}`);
                this.updating = false;
                break;
            case HotUpdateEnums.Code.ERROR_UPDATING:
                console.log(`[${this.option.name}_Updater]`, `Asset update error: ${event.getAssetId()} , ${event.getMessage()}`);
                break;
            case HotUpdateEnums.Code.ERROR_DECOMPRESS:
                console.log(`[${this.option.name}_Updater]`, `${event.getMessage()}`);
                break;
            default:
                break;
        }
        if (failed) {
            this.curAssetsManager.manager.setEventCallback(null);
            this.updating = false;
        }

        if (isUpdateFinished) {
            //下载完成,需要重新设置搜索路径，添加下载路径
            // Prepend the manifest's search path
            var searchPaths: string[] = jsb.fileUtils.getSearchPaths();
            var newPaths: string[] = this.curAssetsManager.manager.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.

            //这里做一个搜索路径去重处理
            let obj = {};
            for (let i = 0; i < searchPaths.length; i++) {
                obj[searchPaths[i]] = true;
            }
            searchPaths = Object.keys(obj);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
        }

        let state = this.curAssetsManager.manager.getState();
        if (this.option.isMain) {
            if (isUpdateFinished) {
                this.curAssetsManager.manager.setEventCallback(null);
                //下载数量大于0，才有必要进入重启，在如下这种情况下，并不会发生下载
                //当只提升了版本号，而并未对代码进行修改时，此时的只下载了一个project.manifest文件，
                //不需要对游戏进行重启的操作
                if (event.getDownloadedFiles() > 0) { cc.game.restart(); }
                //下载完成 删除资源管理器
                this.onCompolete && this.onCompolete()
            }
        } else {
            //子游戏更新
            if (isUpdateFinished) {
                console.log(`[${this.option.name}_Updater]`, `${this.curAssetsManager.name} 下载资源数 : ${event.getDownloadedFiles()}`)
                //下载完成 删除资源管理器  
                this.onCompolete && this.onCompolete()
            }
        }

        let info: IUpdater.IDownLoadInfo = {
            downloadedBytes: event.getDownloadedBytes(),
            totalBytes: event.getTotalBytes(),
            downloadedFiles: event.getDownloadedFiles(),
            totalFiles: event.getTotalFiles(),
            percent: event.getPercent(),
            percentByFile: event.getPercentByFile(),
            code: event.getEventCode(),
            state: state as number,
            needRestart: isUpdateFinished,
            name: this.option.name
        };

        EventManager.dispatchEventWith(EUpdater.HOTUPDATE_DOWNLOAD, info)
        console.log(`[${this.option.name}_Updater]`, `update cb  failed : ${failed}  , need restart : ${isUpdateFinished} , updating : ${this.updating}`);
    }

}



class AssetsManager {
    constructor(name: string) { this.name = name }
    /**@description  当前资源管理器的状态*/
    code: any = -1;
    /**@description 当前资源管理器的名称 */
    name: string = "";
    /**@description 当前资源管理器的实体 jsb.AssetsManager */
    manager: jsb.AssetsManager = null;
}



