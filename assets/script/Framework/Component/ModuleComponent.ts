import { bindService } from "../Decorator/Decorator";
import { IBinder } from "../Defineds/Interfaces/IBinder";
import { IResource } from "../Defineds/Interfaces/IResource";
import { IService } from "../Defineds/Interfaces/IService";
import { getClassName } from "../Extentions/getClassName";
import EventComponent from "./EventComponent";
import { ModuleBinder } from "./ModuleBinder";


export abstract class ModuleComponent extends EventComponent {
    private _service: IService = null
    get service() { return this._service }


    protected maskClose: boolean = true

    protected _binders: { [key: string]: IBinder } = {}

    protected enabledMaskClose() { this.maskClose = true }
    protected disableMaskClose() { this.maskClose = false }

    public get isMaskClose() { return this.maskClose }

    private _bundle: IResource.BUNDLE_TYPE = null;
    /**指向当前View打开时的bundle */
    public set bundle(value) { this._bundle = value }
    public get bundle() { return this._bundle }

    /**@description prefab路径基于 UIManager.open 传入的Bundle */
    static getPrefabUrl() { return "" }

    abstract show(option: ModuleShowOption): void

    abstract hide(option: ModuleHideOption)


    protected addBinder(binder: IBinder): void {
        if (binder instanceof ModuleBinder) { binder['moduleNode'] = this.node }
        let binderName = getClassName(binder)
        if (!this._binders[binderName]) {
            this._binders[binderName] = binder
        }
    }

    /** 被关闭时移除所有注册的Binder */
    protected destroyBinders() {
        for (let key in this._binders) {
            this._binders[key].destroy()
        }
        this._binders = {}
    }

    /**
     * 
     * @param binder  参数为NULL 执行Module下所有Binder内的方法
     * @param funcName 要执行的方法
     * @param args 参数
     * @returns 
     */
    protected excutBinderFunc(binder: ModuleBinder | string | null, funcName: string, ...args) {
        args.unshift(funcName)
        if (binder != null) {
            let name = ""
            if (binder instanceof ModuleBinder) { name = getClassName(binder) }
            else { name = binder }
            let b = this._binders[name]
            if (!b) { return }
            let fun: Function = b["excutFunc"]
            if (fun) { fun.apply(b, args) }
        } else {
            for (let key in this._binders) {
                let b = this._binders[key]
                let fun: Function = b["excutFunc"]
                if (fun) { fun.apply(b, args) }
            }
        }

    }

    protected getComByPath<T extends cc.Component>(com: { prototype: T }, childPath: string): T {
        let childs: string[] = childPath.split("/")
        let n: cc.Node = this.node
        for (let i: number = 0; i < childs.length; i++) { n = n.getChildByName(childs[i]) }
        return n.getComponent(com)
    }

    protected find(childPath: string): cc.Node {
        let childs: string[] = childPath.split("/")
        let n: cc.Node = this.node
        childs.forEach(s => n = n.getChildByName(s))
        return n
    }

    protected excuteModuleFun(funName: string, ...args) {
        let fun: Function = this[funName]
        if (fun != null) { fun.apply(this, args) }
    }

    update(dt) {
        for (let key in this._binders) {
            this._binders[key].update(dt)
        }
    }

    onDestroy() {
        super.onDestroy()
        this.destroyBinders()
    }

    /** 面板被关闭所做的操作 */
    close() { }
}

export interface ModuleHideOption {
    /**
     * 隐藏时传入的数据
     */
    data?: any;

    /**
     * 隐藏动画完毕后的回调函数（如果没有动画，则直接回调）
     */
    onHided: Function;
}


export interface ModuleShowOption {
    /**
     * 展示时传入的数据
     */
    data?: any;

    /**
     * 展示动画完毕后回调的函数（如果没有动画，则直接回调）
     */
    onShowed: Function;
}
