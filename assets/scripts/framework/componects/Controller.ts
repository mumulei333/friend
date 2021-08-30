
import EventComponent from "./EventComponent";
import { Message } from "../core/net/message/Message";
import { Service } from "../core/net/service/Service";

/**
 * @description 控制器基类 , 对service 的自动注入
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class Controller<ServiceType> extends EventComponent {

    /**
     * @description 这个变量会在脚本onLoad时自动赋值，使用者请勿进行修改
     */
    public get service(): ServiceType {
        return <any>(this._service);
    };
    public set service(value: ServiceType) {
        this._service = <any>value;
    }

    protected addEvents() {
        super.addEvents();
        this.addUIEvent(td.Net.NetEvent.ON_OPEN, this.onNetOpen);
        this.addUIEvent(td.Net.NetEvent.ON_CLOSE, this.onNetClose);
        this.addUIEvent(td.Net.NetEvent.ON_ERROR, this.onNetError);
    }

    protected onNetOpen(event: td.Net.ServiceEvent) {
        if (this.service as any == event.service) {
            if (CC_DEBUG) cc.log(`${event.service.serviceName}网络 onNetOpen`);
            return true;
        }
        return false;
    }

    protected onNetClose(event: td.Net.ServiceEvent) {
        if (this.service as any == event.service) {
            if (CC_DEBUG) cc.log(`${event.service.serviceName}网络 onNetClose`);
            return true;
        }
        return false;
    }
    protected onNetError(event: td.Net.ServiceEvent) {
        if (this.service as any == event.service) {
            if (CC_DEBUG) cc.log(`${event.service.serviceName}网络 onNetError`);
            return true;
        }
        return false;
    }

    /**
     * @description 发送请求
     * @param msg msg
     */
    public send(msg: Message) {
        //发送请求数据
        if (this.service instanceof Service) {
            this.service.send(msg)
        } else {
            cc.error("this.service is null")
        }

    }

    protected get bundle(): string {
        cc.error(`请子类重写protected get bundle,返回游戏的包名,即 asset bundle name`);
        return "";
    }

}
