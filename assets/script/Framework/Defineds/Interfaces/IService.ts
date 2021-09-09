import { Process } from "../../Support/NetWork/Socket/Process";
import { Message } from "./IMessage";

export interface IService {
    connect(): void
    send(msg: Message): void
    addListener(eventName: string, handleType: any, handleFunc: Function, isQueue: boolean, target: any): void
    removeListeners(target: any, eventName?: string): void
    setProcess(val: Process): void
}

