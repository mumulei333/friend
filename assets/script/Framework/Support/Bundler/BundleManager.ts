import { AssetsManager } from "../Assets/AssetsManager"
import { EntryManager } from "./../Entry/EntryManager";
import { EBundle } from "../../Defineds/Events/EBundle"
import { EventManager } from "../Event/EventManager"

export class BundleManager {
    private static _instance: BundleManager = null
    public static get Instance() { return this._instance || (this._instance = new BundleManager()) }

    //bundle只允许同时加载一个bundle
    private _isLoading: boolean = false
    private _curBundleOtion: BundleOption = null
    private loadedBundle: Array<string> = []

    /**@description 删除已经加载的bundle */
    public removeLoadedBundle() {
        this.loadedBundle.forEach((value, index, origin) => {
            AssetsManager.Instance.removeBundle(value);
        });
        this.loadedBundle = [];
    }

    /**@description 删除所有加载子游戏的bundle */
    public removeLoadedGamesBundle() {
        let i = this.loadedBundle.length;
        while (i--) {
            AssetsManager.Instance.removeBundle(this.loadedBundle[i]);
            this.loadedBundle.splice(i, 1);
        }
    }


    entryBundle(opt: BundleOption) {
        if (this._isLoading) {
            EventManager.dispatchEventWith(EBundle.BUNDLE_LOADING, { name: this._curBundleOtion.name })
            return
        }
        this._curBundleOtion = opt
        this._isLoading = true
        this._loadBundle()
    }

    private _loadBundle() {
        cc.log("[BundleManager]", `update Game : ${this._curBundleOtion.bundleName}`)
        AssetsManager.Instance.loadBundle(this._curBundleOtion.bundleName, (err, bundle) => {
            this._isLoading = false
            if (err) {
                cc.error("[BundleManager]", `加载 bundle : ${this._curBundleOtion.name} 失败 !!!`);
                EventManager.dispatchEventWith(EBundle.LOAD_BUNDLE_FAIL, { name: this._curBundleOtion.name })
            } else {
                cc.log("[BundleManager]", `加载 bundle : ${this._curBundleOtion.name} 成功 !!!`);
                if (this.loadedBundle.indexOf(this._curBundleOtion.bundleName) == -1) {
                    this.loadedBundle.push(this._curBundleOtion.bundleName)
                }
                this.onGameReady()
            }
        })
    }


    private onGameReady() {
        if (this._isLoading) { this._isLoading = false }
        //这里要干点啥呢

        if (this._curBundleOtion.EntryGame != null && this._curBundleOtion.EntryGame != "") {
            EntryManager.startGameEntry(this._curBundleOtion.EntryGame)
        }
        if (this._curBundleOtion.onComplete) { this._curBundleOtion.onComplete() }
        if (CC_DEBUG) {
            let entryGame = this._curBundleOtion.EntryGame
            let onComplete = this._curBundleOtion.onComplete
            if (entryGame == null || entryGame == "" && !onComplete) {
                cc.log("[BundleManager]", "未找到需要自动打开的GameEntry和加载完毕后自执行方法")
            }
        }
    }

    removeBundleByName(bundle: string) {
        let idx = this.loadedBundle.indexOf(bundle)
        if (idx != -1) {
            AssetsManager.Instance.removeBundle(this.loadedBundle[idx])
            this.loadedBundle.splice(idx, 1)
        }
    }
}


export class BundleOption {
    public name: string
    public bundleName: string
    public index: number
    public EntryGame: string
    public onComplete: Function = null
    //用于提示是否有操作
    public Confirm: (state: number) => void = null
    /**
     * 
     * @param name bundle名 如：大厅
     * @param bundleName Bundle名 如:hall

     * @param option 加载bundle完成后，执行回调
     */
    constructor(opt: option) {
        this.name = opt.name
        this.bundleName = opt.bundleName
        this.index = opt.index ? 0 : opt.index
        this.onComplete = opt.onComplete
        this.EntryGame = opt.entryGame
        this.Confirm = opt.Confirm
    }
}

interface option {
    name: string,
    bundleName: string,
    index?: number,
    entryGame?: string /** 这个参数传入会自动进入子游戏 */
    onComplete?: Function
    Confirm?: (state: number) => void
}