declare let manager: import("./assets/script/Application").Application

declare type WebSocketType = "ws" | "wss";

function dispatchEventWith(type: string, data?: any): void
function dispatchModuleEvent(type: string, moduleName: string, param?: { onHided?: () => void, onShowed?: (error?: Error) => void, data?: any }): void
function addEvent(obj: any, type: string, fun: Function)