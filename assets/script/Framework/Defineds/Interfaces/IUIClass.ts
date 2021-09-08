import { ModuleComponent } from "../../Component/ModuleComponent";

export interface IUIClass<T extends ModuleComponent> {
    new(): T;
    /**
     *@description 视图prefab 地址 resources目录下如z_panels/WeiZoneLayer 
     */
    getPrefabUrl(): string;
}

export type ModuleClass = IUIClass<ModuleComponent>