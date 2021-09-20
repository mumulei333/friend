
/**
 * @description 各种装饰器定义
 */

import { Codec } from "../core/net/message/Message"

export function setServiceByClassName(name: string) {
    // if(CC_DEBUG)    
    return function (target: any) {
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                Log.d(`[setService] ${cc.js.getClassName(this)} onLoad`)
            }
            let service = Manager.serviceManager.getServiceByNmame(name)
            if (CC_DEBUG && !service) {
                Log.d(`[ByNameSetService] 在 ${cc.js.getClassName(this)} 注入[${name}]失败! `)
                service = null
            }
            this._service = service
            __load && __load.call(this)
        }
    }
}
export function setService(service: Service) {
    return function (target: any) {
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                Log.d(`[setService] ${cc.js.getClassName(this)} onLoad`)
            }
            this._service = service
            __load && __load.call(this)
        }
    }
}

export function setServiceCodec(header: typeof Codec) {
    return function (target: any) {
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                Log.d(`[setServiceCodec] ${cc.js.getClassName(this)} onLoad`)
            }
            if (this._service) {
                this._service.Codec = header
            }

            __load && __load.call(this)
        }
    }
}
