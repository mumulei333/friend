import { getClassName } from "../../Extentions/getClassName"
import { AssetsManager } from "../Assets/AssetsManager"
import { GameEntry } from "./GameEntry"

export class EntryManager {
    private static _gameEntrys: { [key: string]: GameEntry } = {}

    //排除列表
    private static _exclude: Array<string> = []

    //排除不被停止的GameEntry
    public static addExclude(exclude: GameEntry | string) {
        let name = this._getClassName(exclude)
        if (this._exclude.indexOf(name) == -1) {
            this._exclude.push(name)
        }
    }

    //移除排除列表
    //删除不被自动停止的GameEntry
    public static removeExclude(exclude: GameEntry | string) {
        let name = this._getClassName(exclude)
        let idx = this._exclude.indexOf(name)
        if (idx != -1) { this._exclude.splice(idx, 1) }
    }

    public static addGameEntry(m: GameEntry, bundle?: string) {
        if (CC_EDITOR) { return }
        let name = getClassName(m)
        if (!this._gameEntrys[name]) {
            m["_bundle"] = bundle
            this._gameEntrys[name] = m
        }
        if (CC_DEBUG) {
            cc.log("[EntryManager]", "GameEntry添加", name)
        }
    }


    public static getGameEntry(name: string): GameEntry | null {
        if (this._gameEntrys[name]) {
            return this._gameEntrys[name]
        }
        return null
    }


    public static stopGameEntry(gameEntry: GameEntry | string) {
        let entryName = this._getClassName(gameEntry)
        if (this._gameEntrys[entryName]) {
            this._gameEntrys[entryName].exitGameEntry()
        }
    }

    public static startGameEntry(gameEntry: GameEntry | string) {
        let entryName = this._getClassName(gameEntry)
        for (let key in this._gameEntrys) {
            if (key == gameEntry) {
                this._gameEntrys[key].runGameEntry()
                continue
            }
            if (this._exclude.indexOf(entryName) == -1) {
                this._gameEntrys[key].exitGameEntry()
            }
        }
    }

    //从内存中卸载掉GameEntry 
    public static unloadGameEntry(gameEntry: GameEntry | string) {
        let entryName = this._getClassName(gameEntry)
        let bundle = this._gameEntrys[entryName]["_bundle"]
        if (this._exclude.indexOf(entryName) == -1) {
            this._gameEntrys[entryName].exitGameEntry()
        }
        /** 主包bundle不允许被卸载 */
        if (bundle == "" || bundle == "resources") { return }
        AssetsManager.Instance.removeBundle(bundle)
    }

    private static _getClassName(gameEntry: GameEntry | string) {
        let entryName = ""
        if (typeof gameEntry == "string") { entryName = gameEntry }
        else { entryName = getClassName(gameEntry) }
        return entryName
    }
}