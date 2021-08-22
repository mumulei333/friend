export class LocalStorage {
    private static _instance: any = null;
    public static Instance() { return this._instance || (this._instance = new LocalStorage()) }
    private logTag = `[LocalStorage]`

    public key: string = "VuxiAKihQ0VR9WRe"


    //TODO 加密未完成
    public getItem(key: string, defaultValue: any = null, encode: boolean = false) {
        let value = cc.sys.localStorage.getItem(key)
        if (!value) { return defaultValue }
        try {
            let dat: any = null
            if (encode) { }
            let result: interfaces.StorageData = JSON.parse(dat)
            if (result.type) { return result.value }
            else { return value }
        } catch (error) { return value }
    }


    public setItem(key: string, val: types.StorageVauleType, decode: boolean = false) {
        let type = typeof val
        if (type == "number" || type == "string" || type == "boolean" || type == "object") {
            let saveObj: interfaces.StorageData = { type: type, value: val }
            let dat = null
            try {
                if (decode) { dat = dat }
                cc.sys.localStorage.setItem(key, dat)
            } catch (e) {
                if (CC_DEBUG) { cc.error(`[${this.logTag}] -> 存储数据类型不支持 当前的存储类型: ${type}`) }
            }
        }
    }

    public removeItem(key: string) {
        cc.sys.localStorage.removeItem(key)
    }
}

// injectWindow(window.td, "LocalStorage", LocalStorage)
