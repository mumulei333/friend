import { EventOption } from "./EventOption";

export class ModuleEvent extends EventOption {

    public static SHOW_MODULE: string = "SHOW_MODULE"

    public static HIDE_MODULE: string = "HIDE_MODULE"

    public static CLOSE_MODULE: string = "CLOSE_MODULE"

    constructor(param: {
        type: string, moduleName: string, onHided?: () => void, onShowed?: (error?: Error) => void,
        data?: any
    }) {
        super(param.type, param.data)
        this._moduleName = param.moduleName
        this._onHided = param.onHided
        this._onShowed = param.onShowed
    }

    //module加载显示完毕回调. 用于确认一些事情
    private _onShowed: (error?: Error) => void = null
    public get onShowed() { return this._onShowed }

    //module隐藏完毕回调. 用于确认一些事情
    private _onHided: () => void = null
    public get onHided() { return this._onHided }

    private _moduleName = null
    public get moduleName() { return this._moduleName }
    // private _moduleOption: IModuleConfig = null

    // public get moduleOption() { return this._moduleOption }
}