import { EntryManager } from "../Support/Entry/EntryManager";
import { GameEntry } from "../Support/Entry/GameEntry";
import { ServiceManager } from "../Support/NetWork/Manager/ServiceManager";
import { ICommonService } from "../Support/NetWork/Socket/ICommonService";


/** 
 * 保存Class名,所有需要使用cc.js.className去获取的类，必须使用此装饰器
 * 获取到的是文件名.所以最好文件名和ClassName 相对应
 *  */
export function ClassName() {
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
export function RegisterEntry(bundle: string = "resources") {
    return function (target: new () => GameEntry) {
        if (target) {
            EntryManager.addGameEntry(new target, bundle)
        }
    }
}

export function registerService() {
    return function (target: new () => ICommonService) {
        if (target instanceof ICommonService) {
            ServiceManager.Instance.register(target)
        }
    }
}

export function bindService(service: string | ICommonService) {
    return function (target: new () => IServerClass) {
        if (target["_service"] == null) {
            let name = ""
            if (service instanceof ICommonService) {
                name = cc.js.getClassName(ICommonService)
            } else { name = service }
            //@ts-ignore
            target["_service"] = ServiceManager.Instance.get(name)
        }

    }
}

