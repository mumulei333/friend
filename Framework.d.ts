declare let manager: import("./assets/script/Application").Application

type GameEntry = import("./assets/script/Framework/Support/Entry/GameEntry").GameEntry
declare type WebSocketType = "ws" | "wss";

function dispatchEventWith(type: string, data?: any): void
function dispatchModuleEvent(type: string, moduleName: string, param?: { onHided?: () => void, onShowed?: (error?: Error) => void, data?: any }): void
function addEvent(obj: any, type: string, fun: Function)

type IService = import("./assets/script/Framework/Defineds/Interfaces/IService").IService
type IReceive = import("./assets/script/Framework/Defineds/Interfaces/IService").IReceive
interface IServerClass {
    readonly service: IService | IReceive
}
