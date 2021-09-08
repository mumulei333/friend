import { IDestroy } from "../Defineds/Interfaces/IDestroy";
import { IResource } from "../Defineds/Interfaces/IResource";
import { UIManager } from "../Support/UIView/UIManager";
import EventComponent from "./EventComponent";
import { ModuleBinder } from "./ModuleBinder";

export abstract class ModuleComponent extends EventComponent {

    protected maskClose: boolean = true

    protected _destroyBinders: Array<IDestroy> = []

    protected enabledMaskClose() { this.maskClose = true }
    protected disableMaskClose() { this.maskClose = false }

    public get isMaskClose() { return this.maskClose }

    private _bundle: IResource.BUNDLE_TYPE = null;
    /**指向当前View打开时的bundle */
    public set bundle(value) { this._bundle = value }
    public get bundle() { return this._bundle }

    private _uiManager: UIManager = UIManager.Instance

    protected get openView() { return this._uiManager.openView }

    /**@description prefab路径基于 UIManager.open 传入的Bundle */
    static getPrefabUrl() { return "" }

    abstract show(option: ModuleShowOption): void

    abstract hide(option: ModuleHideOption)


    protected addBinder(binder: IDestroy): void {
        if (binder instanceof ModuleBinder) {
            binder['moduleNode'] = this.node
        }
        if (this._destroyBinders.indexOf(binder) == -1) {
            this._destroyBinders.push(binder)
        }
    }

    protected destroyBinders() {
        while (this._destroyBinders.length > 0) {
            this._destroyBinders.shift().destroy()
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

    public excuteModuleFun(funName: string, ...args) {
        let fun: Function = this[funName]
        if (fun != null) { fun.apply(this, args) }
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
