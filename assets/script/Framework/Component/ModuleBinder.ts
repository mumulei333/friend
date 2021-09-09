import { IBinder } from "../Defineds/Interfaces/IBinder";
import { IService } from "../Defineds/Interfaces/IService";
import { EventManager } from "../Support/Event/EventManager"

export class ModuleBinder implements IBinder {
    private _service: IService = null
    get service(): IService { return this._service }


    protected node: cc.Node = null
    protected moduleNode: cc.Node = null
    protected _binders: IBinder[] = []


    public constructor() { this.initialize() }

    protected excutFunc(funName: string, ...args: any[]): void {
        let fun: Function = this[funName]
        if (fun != null) { fun.apply(this, args) }
    }

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

    public updateBinder(data: any) { }

    destroy() {
        this.removeEvents()
        this.clearViews()
        this.destoryBinders()
        this.moduleNode = null
        this.node = null
    }

    protected addBinder(binder: IBinder) {
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

    protected getComByPath<T extends cc.Component>(com: { prototype: T }, childPath: string): T {
        let childs: string[] = childPath.split("/")
        let n: cc.Node = this.node
        for (let i: number = 0; i < childs.length; i++) { n = n.getChildByName(childs[i]) }
        return n.getComponent(com)
    }

    public update(dt: number) { }
}