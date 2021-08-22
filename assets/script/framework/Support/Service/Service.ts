import { MessageHeader } from './Message/BaseMessage/MessageHeader';
import Connector from "./Connector";
import { Message } from "./Message/BaseMessage/Message";
import { EventApi } from '../Event/EventApi';

/** @description 处理函数声明 handleType 为你之前注册的handleType类型的数据 返回值number 为处理函数需要的时间 */
export type MessageHandleFunc = (handleTypeData: any) => number;

export abstract class Service extends Connector {
    private _messageHeader: typeof MessageHeader = MessageHeader;
    /**@description 数据流消息包头定义类型 */
    public set messageHeader(value: typeof MessageHeader) { this._messageHeader = value }
    // protected get messageHeader() { return this._messageHeader }

    private _Heartbeat: typeof Message = null;
    /**@description 心跳的消息定义类型 */
    public get heartbeat(): typeof Message { return this._Heartbeat }
    public set heartbeat(value: typeof Message) { this._Heartbeat = value }

    public serviceName = "CommonService";
    /**@description 值越大，优先级越高 */
    public priority: number = 0;

    protected onOpen() {
        super.onOpen();
        dispatch(EventApi.NetEvent.ON_OPEN, { service: this, event: null });
    }

    protected onClose(ev: Event) {
        super.onClose(ev);
        dispatch(EventApi.NetEvent.ON_CLOSE, { service: this, event: ev });
    }
    protected onError(ev: Event) {
        super.onError(ev);
        dispatch(EventApi.NetEvent.ON_ERROR, { service: this, event: ev });
    }

    protected onMessage(data: Uint8Array) {

        //先对包信进行解析
        let header = new this._messageHeader();
        if (!header.decode(data)) {
            cc.error(`decode header error`);
            return;
        }
        super.onMessage(data);
        if (this.isHeartBeat(header)) {
            //心跳消息，路过处理，应该不会有人注册心跳吧
            return;
        }
        cc.log(`recv data main cmd : ${header.CmdName}`);
        let key = header.CmdName
        if (!this._listeners[key]) {
            cc.warn(`no find listener data main cmd : ${header.CmdName}`);
            return;
        }
        if (this._listeners[key].length <= 0) {
            return;
        }

        this.addMessageQueue(key, header, true)
    }

    /**
  * @description 添加服务器数据监听
  * @param handleType 处理类型，指你用哪一个类来进行解析数据
  * @param handleFunc 处理回调
  * @param isQueue 是否进入消息队列
  */
    public addListener(eventName: string, handleType: any, handleFunc: MessageHandleFunc, isQueue: boolean, target: any) {
        let key = eventName;

        if (this._listeners[key]) {
            let hasSame = false;
            for (let i = 0; i < this._listeners[key].length; i++) {
                if (this._listeners[key][i].target === target) {
                    hasSame = true;
                    break;
                }
            }
            if (hasSame) {
                return;
            }
            this._listeners[key].push({
                eventName: eventName,
                func: handleFunc,
                type: handleType,
                isQueue: isQueue,
                target: target
            });
        }
        else {
            this._listeners[key] = [];
            this._listeners[key].push({
                eventName: eventName,
                func: handleFunc,
                type: handleType,
                isQueue: isQueue,
                target: target
            });
        }
    }

    public removeListeners(target: any, eventName?: string) {
        if (eventName) {
            let self = this;
            Object.keys(this._listeners).forEach((value) => {
                let datas = self._listeners[value];
                let i = datas.length;
                while (i--) {
                    if (datas[i].target == target && datas[i].eventName == eventName) {
                        datas.splice(i, 1);
                    }
                }
                if (datas.length == 0) {
                    delete self._listeners[value];
                }
            });

            //移除网络队列中已经存在的消息
            let i = this._masseageQueue.length;
            while (i--) {
                let datas = this._masseageQueue[i];
                let j = datas.length;
                while (j--) {
                    if (datas[j].target == target && datas[i].eventName == eventName) {
                        datas.splice(j, 1);
                    }
                }
                if (datas.length == 0) {
                    this._masseageQueue.splice(i, 1);
                }
            }

        } else {
            let self = this;
            Object.keys(this._listeners).forEach((value: string, index: number, arr: string[]) => {
                let datas = self._listeners[value];

                let i = datas.length;
                while (i--) {
                    if (datas[i].target == target) {
                        datas.splice(i, 1);
                    }
                }

                if (datas.length == 0) {
                    delete self._listeners[value];
                }
            })

            //移除网络队列中已经存在的消息
            let i = this._masseageQueue.length;
            while (i--) {
                let datas = this._masseageQueue[i];
                let j = datas.length;
                while (j--) {
                    if (datas[j].target == target) {
                        datas.splice(j, 1);
                    }
                }
                if (datas.length == 0) {
                    this._masseageQueue.splice(i, 1);
                }
            }
        }
    }

    protected addMessageQueue(key: string, data: any, encode?: boolean) {
        if (this._listeners[key].length <= 0) { return }
        let listenerDatas = this._listeners[key];
        let queueDatas = [];

        for (let i = 0; i < listenerDatas.length; i++) {
            let obj: Message = data
            if (encode) {
                obj = this.decode(listenerDatas[i], data) as Message
            }

            if (listenerDatas[i].isQueue) {
                //需要加入队列处理
                queueDatas.push(this.copyListenerData(listenerDatas[i], obj));
            }
            else {
                //不需要进入队列处理
                try {
                    listenerDatas[i].func && listenerDatas[i].func.call(listenerDatas[i].target, obj);
                } catch (err) {
                    cc.error(err);
                }

            }
        }
        if (queueDatas.length > 0) {
            this._masseageQueue.push(queueDatas);
        }
    }

    /**
     * @description 复制proto协议监听数据
     * @param input 
     * @param data 
     */
    private copyListenerData(input: Socket.ProtoListenerData, data: any): Socket.ProtoListenerData {
        return {
            type: input.type,
            func: input.func,
            isQueue: input.isQueue,
            data: data,
            target: input.target,
            eventName: input.eventName
        };
    }

    /** 监听集合*/
    protected _listeners: { [key: string]: Socket.ProtoListenerData[] } = {};
    /** 消息处理队列 */
    protected _masseageQueue: Array<Socket.ProtoListenerData[]> = new Array<Socket.ProtoListenerData[]>();


    /** 是否正在处理消息 ，消息队列处理消息有时间，如执行一个消息需要多少秒后才执行一下个*/
    protected _isDoingMessage: boolean = false;

    /** @description 可能后面有其它特殊需要，特定情况下暂停消息队列的处理, true为停止消息队列处理 */
    protected _isPause: boolean = false;


    /**
     * @description 暂停消息队列消息处理
     */
    public pauseMessageQueue() { this._isPause = true }

    /**
     * @description 恢复消息队列消息处理
     */
    public resumeMessageQueue() { this._isPause = false }


    /**
         * @description 消息队列处理，由框架调用
         */
    public handMessage() {

        //如果当前暂停了消息队列处理，不再处理消息队列
        if (this._isPause) return;

        //如果当前有函数正在处理
        if (this._isDoingMessage) return;
        //如果当前执行队列为空
        if (this._masseageQueue.length == 0) return;

        let datas = this._masseageQueue.shift();
        if (datas == undefined) return;
        if (datas.length == 0) return;

        this._isDoingMessage = true;
        let handleTime = 0;
        if (CC_DEBUG) cc.log("---handMessage---");
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            if (data.func instanceof Function) {
                try {
                    let tempTime = data.func.call(data.target, data.data);
                    if (typeof tempTime == "number") {
                        handleTime = Math.max(handleTime, tempTime);
                    }
                } catch (error) {
                    cc.error(error);
                }
            }
        }

        if (handleTime == 0) {
            //立即进行处理
            this._isDoingMessage = false;
        }
        else {
            Manager.uiManager.getCanvasComponent().scheduleOnce(() => {
                this._isDoingMessage = false;
            }, handleTime);
        }
    }

    /**
     * @description 重置
     */
    public reset() {
        this._isDoingMessage = false;
        this._listeners = {};
        this._masseageQueue = [];
        this.resumeMessageQueue();
    }

    public close(isEnd: boolean = false) {

        //清空消息处理队列
        this._masseageQueue = [];
        this._isDoingMessage = false;
        //不能恢复这个队列，可能在重新连接网络时，如游戏的Logic层暂停掉了处理队列去加载资源，期望加载完成资源后再恢复队列的处理
        //this.resumeMessageQueue();
        super.close(isEnd);
    }

    protected decode(o: Socket.ProtoListenerData, header: MessageHeader): Message | null {
        let obj: Message = null!;
        if (o.type) {
            obj = new o.type();
            //解包
            obj.decode(header.data);
        } else {
            //把数据放到里面，让后面使用都自己解析
            obj = header.data as any;
        }
        return obj
    }

    public send(msg: Message) {
        if (this._messageHeader) {
            if (msg.encode()) {
                let header = new this._messageHeader()
                header.encode(msg)
                if (this.isHeartBeat(msg)) {
                    if (CC_DEBUG) cc.log(`send request cmd : ${msg.getExcutName} `);
                } else {
                    cc.log(`send request main cmd : ${msg.getExcutName} `);
                }
                this.sendBuffer(header.data);
            } else {
                cc.error(`encode error`);
            }
        } else { cc.error("请求指定数据包头处理类型") }

    }
}