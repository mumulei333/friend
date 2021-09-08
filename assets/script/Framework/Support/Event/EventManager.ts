import { EventDispather } from "./EventDispather";
import { EventOption } from "./EventOption";
import { ModuleEvent } from "./ModuleEvent";

export class EventManager {
    private static dispather: EventDispather = new EventDispather();

    public static addEvent(obj: any, type: string, fun: Function): void {
        this.dispather.addEvent(obj, type, fun);
    }
    public static removeEvent(obj: any, type?: string, fun?: Function): void {
        this.dispather.removeEvent(obj, type, fun);
    }
    public static dispatchEventWith(type: string, data?: any): void {
        this.dispatchEvent(new EventOption(type, data));
    }
    public static dispatchEvent(evt: EventOption): void {
        this.dispather.dispatchEvent(evt);
    }

    public static dispatchModuleEvent(type: string, moduleName: string, param?: { onHided?: () => void, onShowed?: (error?: Error) => void, data?: any }): void {
        let src = {
            type: type, moduleName: moduleName
        }
        Object.assign(src, param)
        this.dispatchEvent(new ModuleEvent(src))
    }
}