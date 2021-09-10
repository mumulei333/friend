import { IListenerData } from "../../../Defineds/Interfaces/IListenerData"
import { AbstractCodec, AbstractSerialize } from "../../../Defineds/Interfaces/IMessage"
import { ProtoManager } from "../../Proto/ProtoManager"

export type MessageHandleFunc = (handleTypeData: any) => number

export class Process {
    public Codec: new () => AbstractCodec = null//DefaultCodec;

    /** 监听集合*/
    protected _listeners: { [key: string]: IListenerData[] } = {};
    /** 消息处理队列 */
    protected _masseageQueue: Array<IListenerData[]> = new Array<IListenerData[]>();


    /** 是否正在处理消息 ，消息队列处理消息有时间，如执行一个消息需要多少秒后才执行一下个*/
    protected _isDoingMessage: boolean = false;

    /** @description 可能后面有其它特殊需要，特定情况下暂停消息队列的处理, true为停止消息队列处理 */
    public isPause: boolean = false;

    /**
     * @description 暂停消息队列消息处理
     */
    public pauseMessageQueue() { this.isPause = true }

    /**
     * @description 恢复消息队列消息处理
     */
    public resumeMessageQueue() { this.isPause = false }


    public handMessage() {

        //如果当前暂停了消息队列处理，不再处理消息队列
        if (this.isPause) return;

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
            manager.layerManager.getCanvasComponent().scheduleOnce(() => {
                this._isDoingMessage = false;
            }, handleTime);
        }
    }

    public onMessage(code: AbstractCodec) {
        cc.log(`recv data main cmd : ${code.getCmdID()}`);
        let key = code.getCmdID();
        if (!this._listeners[key]) {
            cc.warn(`no find listener data main cmd : ${code.getCmdID()}`);
            return;
        }
        if (this._listeners[key].length <= 0) {
            return;
        }

        this.addMessageQueue(key, code, true)
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

    public close() {
        this._masseageQueue = [];
        this._isDoingMessage = false;
    }

    public addListener(eventName: string, handleFunc: MessageHandleFunc, isQueue: boolean, target: any) {
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
                isQueue: isQueue,
                target: target
            });
        }
        else {
            this._listeners[key] = [];
            this._listeners[key].push({
                eventName: eventName,
                func: handleFunc,
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

    protected decode(o: IListenerData, header: AbstractCodec): AbstractSerialize | null {
        let obj: AbstractSerialize = null;
        let proto = ProtoManager.Instance.getProto(o.eventName)
        if (proto) {
            obj = new proto();
            //解包
            obj.Deserialize(header.getData());
        } else {
            //把数据放到里面，让后面使用都自己解析
            obj = header.getData();
        }
        return obj
    }

    public addMessageQueue(key: string, data: any, encode: boolean) {
        if (this._listeners[key].length <= 0) { return }
        let listenerDatas = this._listeners[key];
        let queueDatas = [];

        for (let i = 0; i < listenerDatas.length; i++) {
            let obj: AbstractSerialize = data
            if (encode) {
                obj = this.decode(listenerDatas[i], data) as AbstractSerialize
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
    private copyListenerData(input: IListenerData, data: any): IListenerData {
        return {
            func: input.func,
            isQueue: input.isQueue,
            data: data,
            target: input.target,
            eventName: input.eventName
        };
    }
}