import { ModuleComponent } from "../../Component/ModuleComponent";
import { IModuleConfig } from "../../Defineds/Interfaces/IModuleConfig";
import { ICommonModuleOption } from "../../Defineds/Interfaces/IModuleOption";

export class ModuleManager {
    private static _domains: { [key: string]: IModuleConfig } = {}

    private static _modules: { [key: string]: ModuleComponent } = {}

    public static addModuleOpt(module: IModuleConfig, force?: boolean) {
        if (!force && this._domains[module.moduleName] != undefined) {
            cc.log("重复设置名称为 ", module.moduleName, " 的模块！！！")
        } else {
            this._domains[module.moduleName] = module
        }
    }

    public static addModule(module: ModuleComponent, config: IModuleConfig) {
        this._modules[config.moduleName] = module
    }

    public static getModule(moduleName: string) {
        if (this._modules[moduleName]) { return this._modules[moduleName] }
    }

    public static getModuleOption(moduleName: string) {
        return this._domains[moduleName]
    }


    public static removeModule(moduleName: string) {
        if (this._modules[moduleName]) {
            delete this._modules[moduleName]
        }
    }

    public static hasModule(moduleName: string) {
        return this._modules[moduleName] != null
    }

}