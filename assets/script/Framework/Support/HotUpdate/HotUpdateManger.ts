import { IUpdater } from "../../Defineds/Interfaces/IUpdater";
import { Updater } from "./Updater";

export class HotUpdateManager {

    private static _updaters: Map<string, Updater> = new Map()
    private static get isBrowser() {
        return cc.sys.platform == cc.sys.WECHAT_GAME || CC_PREVIEW || cc.sys.isBrowser;
    }

    static getUpdater(key: string): Updater | null {
        if (this._updaters.has(key)) {
            return this._updaters.get(key)
        }
        return null
    }

    static checkUpdate(callback: IUpdater.updateCallback, option: IUpdater.UpdaterOption = null) {
        if (this.isBrowser) {
            this.checkUpdateWeb(callback)
        } else {
            this.checkUpdateNative(option, callback)
        }

    }

    private static checkUpdateWeb(updateCallback: IUpdater.updateCallback) {
        this._updaters.set("webview", new Updater(null, updateCallback, () => {
            this._updaters.delete("webview")
        }))
    }
    private static checkUpdateNative(option: IUpdater.UpdaterOption, updateCallback) {
        if (this._updaters.size >= 2 && !this.isBrowser) {
            cc.log(`[HotUpdateManager]`, "当前已达最大任务数")
            return
        }
        else {
            this._updaters.set(option.name, new Updater(option, updateCallback, () => {
                this._updaters.delete(option.name)
            }))
        }
    }

    static startUpdate(name: string) {
        if (this._updaters.has(name)) {
            this._updaters.get(name).runHotUpdate()
        }
    }

    static tryUpdate(name: string) {
        if (this._updaters.has(name)) {
            this._updaters.get(name).downloadFailedAssets()
        }
    }






}

