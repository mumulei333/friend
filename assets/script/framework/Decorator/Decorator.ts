import { MessageHeader } from '../Support/Service/Message/BaseMessage/MessageHeader';
import { Loading } from "../../Common/Component/Loading";
import { Service } from "../Support/Service/Service";

export function setServiceByClassName(name: string) {
    // if(CC_DEBUG)    
    return function (target: any) {
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                cc.log(`[setService] ${cc.js.getClassName(this)} onLoad`)
            }
            let service = Manager.serviceManager.getServiceByNmame(name)
            if (CC_DEBUG && !service) {
                cc.log(`[ByNameSetService] 在 ${cc.js.getClassName(this)} 注入[${name}]失败! `)
                service = null
            }
            this._service = service
            __load && __load.call(this)
        }
    }
}
export function setService(service: Service) {
    return function (target: any) {
        debugger
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                cc.log(`[setService] ${cc.js.getClassName(this)} onLoad`)
            }
            this._service = service
            __load && __load.call(this)
        }
    }
}

export function setServiceMessageHeader(header: typeof MessageHeader) {
    return function (target: any) {
        let __load = target.prototype.onLoad
        target.prototype.onLoad = function () {
            if (CC_DEBUG) {
                cc.log(`[setServiceMessageHeader] ${cc.js.getClassName(this)} onLoad`)
            }
            if (this._service) {
                this._service.messageHeader = header
            }

            __load && __load.call(this)
        }
    }
}