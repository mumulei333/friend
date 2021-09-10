import { AbstractCodec, AbstractSerialize } from "../Defineds/Interfaces/IMessage";
import { getClassName } from "../Extentions/getClassName";
import { EntryManager } from "../Support/Entry/EntryManager";
import { GameEntry } from "../Support/Entry/GameEntry";
import { ServiceManager } from "../Support/NetWork/Manager/ServiceManager";
import { ICommonService } from "../Support/NetWork/Socket/ICommonService";
import { ProtoManager } from "../Support/Proto/ProtoManager";


export namespace decorator {

    /** 
     * 和监听的网络事件一致就OK了
     * 否则会使用类名作为事件名
     *  */
    export function registerProto(eventName: string = "") {
        return function (target: new () => AbstractSerialize) {
            if (target instanceof AbstractSerialize) {
                ProtoManager.Instance.register(target, eventName)
            }
        }
    }
    /** 
     * 保存Class名,所有需要使用cc.js.className去获取的类，必须使用此装饰器
     * 获取到的是文件名.所以最好文件名和ClassName 相对应
     *  */
    export function className() {
        return function (target) {
            let frameInfo = cc['_RF'].peek()
            let script = frameInfo.script;
            cc.js.setClassName(script, target)
        }
    }

    /** 
     * 所有继承自GameEntry的必须使用此装饰器装饰
     * 自动注册到GameEntryManager 用于管理子游戏进入 
     * */
    export function registerEntry(bundle: string = "resources") {
        return function (target: new () => GameEntry) {
            if (target) {
                EntryManager.addGameEntry(new target, bundle)
            }
        }
    }

    /**
     * 绑定GameEntry ModuleComponent Binder 的网络对象
     * @param service 
     * @returns 
     */
    export function bindService(service: string | ICommonService) {
        return function (target: new () => IServerClass) {
            if (target["_service"] == null) {
                let name = ""
                if (service instanceof ICommonService) {
                    name = getClassName(ICommonService)
                } else { name = service }
                //@ts-ignore
                target["_service"] = ServiceManager.Instance.get(name)
            }
        }
    }


    /**
     * 注册网络服务到服务管理器
     * @param codec 需要附加的解码器
     * @returns void
     */
    export function registerService(codec: new () => AbstractCodec) {
        return function (target: new () => ICommonService) {
            let t = new target
            if (t instanceof ICommonService) {
                ServiceManager.Instance.register(t, codec)
            }
        }
    }
}
