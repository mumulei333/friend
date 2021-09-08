import { IDestroy } from "../Defineds/Interfaces/IDestroy";
import { EventManager } from "../Support/Event/EventManager"

export class ModuleBinder implements IDestroy {

    protected node: cc.Node = null
    protected moduleNode: cc.Node = null
    protected _binders: IDestroy[] = []


    public constructor() { this.initialize() }

    public initialize(): void { }

    public setNode(node: cc.Node, ...args: any[]) {
        if (this.node != null) {
            this.removeEvents()
            this.clearViews()
        }
        this.node = node
        this.initViews()
        this.addEvents()
    }

    protected initViews() { }
    protected addEvents() { }

    protected clearViews() { }
    protected removeEvents() { EventManager.removeEvent(this) }
    public update(data: any) { }

    destroy() {
        this.removeEvents()
        this.clearViews()
        this.destoryBinders()
        this.moduleNode = null
        this.node = null
    }

    protected addBinder(binder: IDestroy) {
        if (this._binders.indexOf(binder) == -1) {
            this._binders.push(binder)
        }
    }

    protected destoryBinders() {
        while (this._binders.length > 0) {
            this._binders.shift().destroy()
        }
    }
    protected find(childPath: string): cc.Node {
        let childs: string[] = childPath.split("/")
        let n: cc.Node = this.node
        childs.forEach(s => n = n.getChildByName(s))
        return n
    }
}