export class EventDispatcher {
    private static _instance: any = null;
    public static Instance() { return this._instance || (this._instance = new EventDispatcher()) }
    private logTag = `[EventDispatcher]`


    private _eventCaches: { [key: string]: Array<interfaces.IEvent> } = null

    constructor() { this._eventCaches = {} }

    /**
     * @description     添加事件
     * @param type      事件类型
     * @param fn        事件回调
     * @param target    事件作用域
     */
    public addEventListener(type: string, fn: types.EventCallBack, target: any): void {
        if (!type || !fn || !target) { return }
        let eventCaches: Array<interfaces.IEvent> = this._eventCaches[type] || []
        let hasSam = false
        for (let i = 0; i < eventCaches.length; i++) {
            if (eventCaches[i].target === target) {
                hasSam = true
                break
            }
        }
        if (hasSam) { return }
        let newEvent: interfaces.IEvent = { type: type, callback: fn, target: target }
        eventCaches.push(newEvent)
        this._eventCaches[type] = eventCaches
    }

    /**
    * @description 移除事件
    * @param type 事件类型
    * @param target 
    */
    public removeEventListener(type: string, target: any) {
        if (!type || !target) { return }
        let eventCache: Array<interfaces.IEvent> = this._eventCaches[type]
        if (!eventCache) { return }
        for (let i = 0; i < eventCache.length; i++) {
            if (eventCache[i].target === target) {
                eventCache.splice(i, 1)
                break
            }
        }
        if (eventCache.length == 0) { delete this._eventCaches[type] }
    }

    /**
     * @description 派发事件
     * @param type 事件类型
     * @param data 事件数据
     */
    public dispatchEvent(type: string, data?: any) {
        if (!type) { return }
        let eventCaches: Array<interfaces.IEvent> = this._eventCaches[type]
        if (!eventCaches) { return }
        for (let i = 0; i < eventCaches.length; i++) {
            let event = eventCaches[i]
            try {
                if (typeof Reflect == "object") {
                    if (typeof event.callback == "string") {
                        let func = Reflect.get(event.target, event.callback);
                        if (func) {
                            if (CC_DEBUG) cc.log(`${this.logTag} apply string func : ${event.callback} class : ${cc.js.getClassName(event.target)}`)
                            Reflect.apply(func.bind(event.target), event.target, [data])
                        } else {
                            if (CC_DEBUG) cc.error(`${this.logTag} class : ${cc.js.getClassName(event.target)} no func : ${event.callback}`)
                        }
                    }
                    else {
                        Reflect.apply(event.callback, event.target, [data])
                    }
                } else {
                    if (typeof event.callback == "string") {
                        if (event.target && event.callback) {
                            let func = event.target[event.callback]
                            if (func && typeof func == "function") {
                                func.apply(event.target, [data]);
                            } else {
                                if (CC_DEBUG) cc.error(`${event.callback} is not function`)
                            }
                        } else {
                            if (CC_DEBUG) cc.error(`target or callback is null`)
                        }
                    } else {
                        if (event.callback && event.target) {
                            event.callback.apply(event.target, [data])
                        } else {
                            if (CC_DEBUG) cc.error(`callback is null`)
                        }
                    }
                }

            } catch (error) { cc.error(error) }
        }
    }
}

