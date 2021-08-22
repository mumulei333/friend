import { EventDispatcher } from "./EventDispatcher";

// td.EventDispatcher = EventDispatcher
window.dispatch = function (name: string, data?: any) {
    if (CC_DEBUG && !CC_EDITOR) cc.log(`[dispatch] ${name} data : ${data}`);
    //向自己封闭的管理器中也分发
    EventDispatcher.Instance().dispatchEvent(name, data);
}