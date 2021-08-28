import { Message } from "../Service/Codec/Codec";
import { Service } from "../Service/Service"
/**@description 这个地方做下特殊处理，防止外面的人进行修改 */
const addListeners = Symbol("addListeners");
const removeEventListeners = Symbol("removeEventListeners");

interface EventArgs {
    name?: string,
    func?: (data: any) => any;
    handleType?: any,
    isQueue?: boolean,
    netEvent?: boolean,
}

type fn = (data: any) => void

const { ccclass, property } = cc._decorator
@ccclass
export class EventComponent extends cc.Component {
    protected _service: Service = null
    protected logTag = `[EventComponent]`;
    private _uiEvents: EventArgs[] = [];

    private _getEventArgs(): EventArgs {
        if (arguments.length < 2) {
            if (CC_DEBUG) cc.error(`注册事件参数错误`);
            return null;
        }

        let args: EventArgs = {};
        if (typeof arguments[0] == "string") {
            //普通消息注册
            args.name = arguments[0];
            args.func = arguments[1];
        } else {
            //网络消息注册
            args.name = arguments[0]

            args.handleType = null;
            args.isQueue = true;
            if (arguments.length >= 2) {
                args.func = arguments[1];
            }
            if (arguments.length >= 3) {
                args.handleType = arguments[2];
            }
            if (arguments.length >= 4) {
                args.isQueue = arguments[3];
            }
            if (arguments.length >= 5) {
                args.netEvent = arguments[4];
            }
        }
        return args;
    }




    addNetEvent(evtName: string, func: fn, handlerType?: typeof Message, isQueue: boolean = false) {
        //普通消息
        if (this._service) {
            this._service.addListener(
                evtName,
                handlerType,
                func,
                isQueue,
                this
            );
        }
    }

    /**
     * @description 注册UI事件 ，在onLoad中注册，在onDestroy自动移除
     * @param manCmd 
     * @param subCmd 
     * @param func 处理函数
     * @param handleType 消息解析类型
     * @param isQueue 是否加入队列
     */
    /**
     * 注册事件 ，在onLoad中注册，在onDestroy自动移除
     * @param eventName 
     * @param func 
     */
    addUIEvent(eventName: string, func: (data: any) => void) {
        let args = { eventName: eventName, func: func }
        this._uiEvents.push(args)
    }


    /**
     * @description 删除普通事件
     * @param eventName 事件名
     */
    removeEvent(eventName: string) {
        //事件移除
        Manager.eventDispatcher.removeEventListener(arguments[0], this);

        if (this._service) { this._service.removeListeners(this, eventName) }
        //删除本地事件
        let i = this._uiEvents.length
        while (i--) {
            if (this._uiEvents[i].name == eventName) {
                this._uiEvents.splice(i, 1)
            }
        }

    }

    protected bindUIEvent() { }
    protected bindNetEvent() { }

    onLoad() {
        this.bindUIEvent();
        this.bindNetEvent()
        this[addListeners]();
    }

    onDestroy() { this[removeEventListeners]() }

    [addListeners]() {
        for (let i = 0; i < this._uiEvents.length; i++) {
            let event = this._uiEvents[i];
            Manager.eventDispatcher.addEventListener(event.name, event.func, this);
            // if (!event.netEvent) {
            //     //普通事件注册
            //     Manager.eventDispatcher.addEventListener(event.name, event.func, this);
            // } else {
            //     //网络消息事件注册
            //     if (this._service) {
            //         this._service.addListener(
            //             event.name,
            //             event.handleType,
            //             event.func,
            //             event.isQueue,
            //             this
            //         )
            //     }
            // }
        }
    }

    [removeEventListeners]() {
        for (let i = 0; i < this._uiEvents.length; i++) {
            let event = this._uiEvents[i];
            if (event.name) {
                //普通事件注册
                Manager.eventDispatcher.removeEventListener(event.name, this);
            }
        }

        if (this._service) {
            this._service.removeListeners(this);
            this._service = null;
        }

    }
}