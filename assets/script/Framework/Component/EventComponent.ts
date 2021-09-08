import { EventManager } from "../Support/Event/EventManager";

const { ccclass } = cc._decorator
const addEvents = Symbol("addEvents");
// const removeEvents = Symbol("removeEvents");

interface evt { type: string, fn: Function }
@ccclass
export default class EventComponent extends cc.Component {
    private _events: Array<evt> = []

    protected addEvents() { }
    protected removeEvenrs() { EventManager.removeEvent(this) }


    protected UIEvent(type: string, fn: Function) { this._events.push({ type: type, fn: fn }) }
    protected NetEvent() { }



    onLoad() {
        this.addEvents()
        this[addEvents]()
    }

    onDestroy() {
        this.removeEvenrs()
    }

    [addEvents]() {
        for (let i = 0; i < this._events.length; i++) {
            let event = this._events.pop();
            EventManager.addEvent(this, event.type, event.fn)
        }
    }
}