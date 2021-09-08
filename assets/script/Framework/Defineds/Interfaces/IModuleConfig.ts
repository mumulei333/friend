import { ModuleClass } from "./IUIClass";

export interface IModuleConfig {
    component: ModuleClass
    bundle?: string
    layer?: number
    zIndex?: number
    moduleName: string
    name: string
}