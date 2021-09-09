import { getClassName } from "../../../Extentions/getClassName";
import { ICommonService } from "../Socket/ICommonService";


export class ServiceManager {
    private static _instance: ServiceManager = null
    public static get Instance() { return this._instance || (this._instance = new ServiceManager()); }

    private _service: Map<string, ICommonService> = new Map()

    register(service: new () => ICommonService) {
        let serviceName = this._getServiceName(service)
        if (!this._service.has(serviceName)) {
            this._service.set(serviceName, new service())
        }
    }

    get(service: (new () => ICommonService) | string) {
        let name = this._getServiceName(service)
        if (this._service.has(name)) {
            return this._service.get(name)
        }
    }


    connect(service: (new () => ICommonService) | string) {
        let name = this._getServiceName(service)
        if (this._service.has(name) && !this._service.get(name).isConnected) {
            this._service[name].connect()
        }
    }


    close(service: (new () => ICommonService) | string) {
        let name = this._getServiceName(service)
        if (this._service.has(name) && this._service.get(name).isConnected) {
            this._service[name].close()
        }
    }

    /**
     * 
     * @param service 要移除的服务或者服务名
     * 调用此方法会在移除服务的同时关闭服务
     */
    remove(service: string | (new () => ICommonService), close: boolean = false) {
        let name = this._getServiceName(service)
        let s = this._service.get(name)
        if (s) {
            if (s.isConnected && close) { s.close() }
            this._service.delete(name)
        }
    }

    private _getServiceName(service: (new () => ICommonService) | string): string {
        let name = ""
        if (service instanceof ICommonService) {
            name = getClassName(service)
        } else { name = service as unknown as string }
        return name
    }

    update() {
        let v = this._service.values()
        let ret: IteratorResult<ICommonService, ICommonService> = null
        while (ret = v.next(), !ret.done) {
            ret.value.handMessage()
        }
    }
}