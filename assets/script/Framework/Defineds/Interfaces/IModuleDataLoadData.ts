import { ModuleComponent } from "../../Component/ModuleComponent";
import { IResource } from "./IResource";
import { IUIClass } from "./IUIClass";

export interface IModuleDataLoadData {
    component?: IUIClass<ModuleComponent>
    prefab?: cc.Prefab
    prefabUrl?: string
    bundle?: IResource.BUNDLE_TYPE
    layer?: number
    zIndex?: number

    data?: any

    hided?: Function
    showed?: Function
}