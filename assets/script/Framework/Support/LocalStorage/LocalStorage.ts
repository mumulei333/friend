
/**
 * @description 本地数据存储，为了后面可能需要对数据进入加密保存等，把cocos的封闭一层
 */

import { BitEncrypt } from "../../Extentions/BitEncrypt";

type StorageVauleType = "number" | "string" | "boolean" | "object";
interface StorageData {
    type: StorageVauleType,
    value: string | number | boolean | object;
}

export class LocalStorage {

    private static _instance: LocalStorage = null;
    public static get Instance() { return this._instance || (this._instance = new LocalStorage()); }

    public key = "VuxiAKihQ0VR9WRe";

    //aes加密 
    private encrypt(obj: {}) {
        return BitEncrypt.encode(JSON.stringify(obj), this.key);
    }

    private decryption(word) {
        return BitEncrypt.decode(word, this.key);
    }

    public getItem(key: string, encrypt: boolean = true, defaultValue: any = null) {
        let value = cc.sys.localStorage.getItem(key);
        if (value) {
            //解析
            if (encrypt) {
                try {
                    let data = this.decryption(value);
                    let result: StorageData = JSON.parse(data);
                    if (result.type) {
                        return result.value;
                    } else {
                        return value;
                    }
                } catch (error) {
                    return value;
                }
            } else {
                let result: StorageData = JSON.parse(value);
                if (result.type) {
                    return result.value;
                } else {
                    return result
                }
            }
        }
        else {
            return defaultValue;
        }
    }

    public setItem(key: string, value: string | number | boolean | object, encrypt: boolean = true) {
        let type = typeof value;
        if (type == "number" || type == "string" || type == "boolean" || type == "object") {
            let saveObj: StorageData = { type: type, value: value };
            let data = value
            if (encrypt) {
                //加密
                try {
                    let data = this.encrypt(saveObj);

                } catch (error) {
                    if (CC_DEBUG) cc.error(error);
                }
            }
            cc.sys.localStorage.setItem(key, data);
        } else {
            if (CC_DEBUG) cc.error(`存储数据类型不支持 当前的存储类型: ${type}`);
        }
    }

    public removeItem(key: string) {
        cc.sys.localStorage.removeItem(key);
    }
}