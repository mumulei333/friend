import { Process } from "../../Support/NetWork/Socket/Process";
import { AbstractSerialize } from "./IMessage";

export interface IService {
    send(msg: AbstractSerialize): void
}

export interface IReceive {
    connect(): void
    addListener(eventName: string, handleFunc: Function, isQueue: boolean, target: any): void
    removeListeners(target: any, eventName?: string): void
    setProcess(val: Process): void
    close(): void
}