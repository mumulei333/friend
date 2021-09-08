import { Dictionary } from "../../Libs/Dictionary";
import { EventOption } from "./EventOption";

export class EventDispather {
    private events: Dictionary<any, any>
    public constructor() { this.events = new Dictionary() }

    public addEvent(obj: any, type: string, fun: Function): void {
        if (!this.events.hasKey(obj)) { this.events.setValue(obj, { length: 0 }) }
        let o = this.events.getValue(obj);
        if (o[type] == undefined) {
            o[type] = []
            o.length++
        }
        var funs: any[] = o[type]
        if (funs.indexOf(fun) == -1) { funs.push(fun) }
    }

    public removeEvent(obj: any, type?: string, fun?: Function): void {
        if (!this.events.hasKey(obj)) { return }
        let o = this.events.getValue(obj)
        var funs: any[]
        if (type != null) {
            if (!o[type]) { return }
            funs = o[type]
            if (fun != null) {
                var index: number = funs.indexOf(fun)
                if (index > -1) funs.splice(index, 1)
            } else {
                funs = o[type]
                while (funs.length > 0) { funs.shift() }
            }
            if (funs.length == 0) {
                o.length--
                delete o[type];
            }
        } else {
            for (let s in o) {
                if (s == "length") { continue };
                funs = o[s]
                o.length--
                while (funs.length > 0) { funs.shift() }
            }
        }
        if (o.length <= 0) { this.events.remove(obj) }
    }
    public dispatchEvent(evt: EventOption): void {
        let type = evt.type
        let objs = this.events.getKeys()
        let o: any, obj: any, funs: Array<Function>;
        for (let i = 0; i < objs.length; i++) {
            obj = objs[i]
            o = this.events.getValue(obj)
            if (!o[type]) { continue }
            funs = o[type]
            for (let j = 0; j < funs.length; j++) {
                if (funs[j].length == 0) funs[j].call(obj)
                else funs[j].call(obj, evt)
            }
        }
    }
}