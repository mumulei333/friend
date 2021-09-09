import { Process } from "../../Support/NetWork/Socket/Process";
import { Message } from "./IMessage";

export interface IService {
    send(msg: Message): void
}

export interface IReceive {
    connect(): void
    addListener(eventName: string, handleType: any, handleFunc: Function, isQueue: boolean, target: any): void
    removeListeners(target: any, eventName?: string): void
    setProcess(val: Process): void
    close(): void
}