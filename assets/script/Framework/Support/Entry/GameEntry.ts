import { IModuleConfig } from "../../Defineds/Interfaces/IModuleConfig";
import { IService } from "../../Defineds/Interfaces/IService";
import { EventManager } from "../Event/EventManager";
import { ModuleEvent } from "../Event/ModuleEvent";
import { ModuleManager } from "../Module/ModuleManager";

export class GameEntry {
    private _service: IService = null
    get service() { return this._service }


    private _bundle: string = ""
    protected bundle() { return this._bundle }

    private _isRun: boolean = false

    private _events: { [key: string]: string[] } = {}

    private _modules: string[] = []
    protected get modules() { return this._modules }

    protected addModule(opt: IModuleConfig, moduleName?: string, ...events: string[]) {
        if (opt.bundle == null || opt.bundle == "") { opt.bundle = this.bundle() }
        if (moduleName != null && moduleName != "") { opt.moduleName = moduleName }
        this._addModule(opt, events)
    }


    private _addModule(opt: IModuleConfig, events: string[]) {
        let mName = opt.moduleName
        if (this._modules == null) { this._modules = [] }
        if (this._modules.indexOf(mName) == -1) {
            this._modules.push(mName)
        }
        ModuleManager.addModuleOpt(opt)
        for (let i = 0; i < events.length; i++) {
            if (this._events[events[i]] == null) {
                this._events[events[i]] = []
            }
            if (this._events[events[i]].indexOf(mName) == -1) {
                this._events[events[i]].push(mName)
            }
        }
    }

    /**
     * 执行模块方法,需要注册 
     * 注意.此方法在module hide的时候也会被执行
     * */
    protected excutModuleFunc(eventName: string, funName: string, ...args) {
        if (!this._events) { return }
        let modules = this._events[eventName]
        if (modules != null) {
            args.unshift(funName)
            for (let i = 0; i < modules.length; i++) {
                let m = ModuleManager.getModule(modules[i])
                if (m == null) { continue }
                let fun: Function = m["excuteModuleFun"]
                if (fun != null) { fun.apply(m, args) }
            }
        }
    }

    //初始化GameEntry时候要做啥
    protected initEntry() { }

    //GameEntry时初始化界面
    protected initViews() { }


    protected addEvents() { }

    protected removeEvents() { EventManager.removeEvent(this) }

    /** gameEntry退出时需要关闭的窗口 */
    protected close() { }

    protected closeViews() {
        while (this.modules.length > 0) {
            let mName = this._modules.shift()
            dispatchModuleEvent(ModuleEvent.CLOSE_MODULE, mName)
        }
    }

    public runGameEntry() {
        if (this._isRun) { return }
        this._isRun = true
        this.initEntry()
        this.initViews()
        this.addEvents()
    }

    public exitGameEntry() {
        if (!this._isRun) { return }
        this._isRun = false
        this.removeEvents()
        this.close()
    }
}


