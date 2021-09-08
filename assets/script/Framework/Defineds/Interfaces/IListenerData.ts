import { Message } from "./IMessage";

export type THandleFunc = (handleTypeData: any) => number;
export interface IListenerData {
    eventName: string
    func: THandleFunc, //处理函数
    type: new () => Message, //解包类型
    isQueue: boolean,//是否进入消息队列，如果不是，收到网络消息返回，会立即回调处理函数
    data?: any, //解包后的数据
    target?: any, //处理者
}