import { ModuleComponent } from "../../Component/ModuleComponent";
import { IResource } from "./IResource";
import { IUIClass } from "./IUIClass";

export interface ICommonModuleOption {
    ModuelConfig: IModuleConfig,
    data?: any
}

interface IModuleConfig {
    component: IUIClass<ModuleComponent>,
    bundle?: IResource.BUNDLE_TYPE,
    name?: string
    layer?: number,
    zIndex?: number,
    onShowed?(error?: Error): void
    onHided?(): void
}

export interface IShowModuleOption extends ICommonModuleOption {
    onShowed?(error?: Error): void
}

export interface IHideModuleOption extends ICommonModuleOption {
    onHided?(): void
}