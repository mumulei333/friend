import { AssetsManager } from "../Assets/AssetsManager";
import { EUIManager } from "./../../Defineds/Events/EUIManager";
import { EventManager } from "./../Event/EventManager";
import { ModuleComponent } from "../../Component/ModuleComponent";
import { LayerEnum } from "../../Defineds/Enums/LayerEnum";
import { ModuleStatusEnum } from "../../Defineds/Enums/ModuleStatusEnum";
import { IHideModuleOption, IShowModuleOption } from "../../Defineds/Interfaces/IModuleOption";
import { IResource } from "../../Defineds/Interfaces/IResource";
import { IUIClass } from "../../Defineds/Interfaces/IUIClass";
import { LayerManager } from "../Layer/LayerManager";
import { BUNDLE_RESOURCES } from "./Const";
import { ModuleData } from "./ModuleData";

export class UIManager {
    private _logtag: string = "UIManager"
    private static _instance: UIManager = null!;
    public static get Instance() { return this._instance || (this._instance = new UIManager()); }
    public preload(com: IUIClass<ModuleComponent>, bundle: IResource.BUNDLE_TYPE) {
        return this._open(
            com, {
            ModuelConfig: {
                component: com,
                bundle: bundle
            }
        })
    }

    public openView(opt: IShowModuleOption): Promise<ModuleComponent> {
        if (opt.ModuelConfig.bundle == null || opt.ModuelConfig.bundle == "") { opt.ModuelConfig.bundle = "resources" }
        if (opt.ModuelConfig.layer == null) { opt.ModuelConfig.layer = LayerEnum.GameLayer.Content }
        if (opt.ModuelConfig.zIndex == null) { opt.ModuelConfig.layer = 0 }
        return this._open(opt.ModuelConfig.component, opt, false)
    }

    private _open(module: IUIClass<ModuleComponent>, opt: IShowModuleOption, isPreload: boolean = false): Promise<ModuleComponent> {
        return new Promise<ModuleComponent>(reslove => {
            if (!module) {
                if (CC_DEBUG) cc.log(`[${this._logtag}]`, 'open ui class error');
                return reslove(null);
            }
            let className = cc.js.getClassName(module)
            let moduleData = this.getViewData(module)
            if (moduleData) {
                moduleData.isPreload = isPreload
                this._openByViewData(moduleData, opt, isPreload, reslove)
            } else {
                moduleData = this._getNewModuleData(module, opt, className, isPreload)
                let progressCallback: (completedCount: number, totalCount: number, item: any) => void = null
                if (!isPreload) {
                    // Manager.uiLoading.show(delay, name);
                    //预加载界面不显示进度
                    progressCallback = (completedCount: number, totalCount: number, item: any) => {
                        let progress = Math.ceil((completedCount / totalCount) * 100);
                        EventManager.dispatchEventWith(EUIManager.SHOW_LOADING, {
                            name: opt.ModuelConfig.name,
                            progress: progress,
                            className: className,
                        })
                        // Manager.uiLoading.updateProgress(progress);
                    };
                }
                this.loadPrefab(opt.ModuelConfig.bundle, moduleData.ViewData.prefabUrl, progressCallback)
                    .then((prefab) => {
                        moduleData.info = new IResource.ResourceInfo();
                        moduleData.info.url = moduleData.ViewData.prefabUrl;
                        moduleData.info.type = cc.Prefab;
                        moduleData.info.data = prefab;
                        moduleData.info.bundle = opt.ModuelConfig.bundle;
                        AssetsManager.Instance.retainAsset(moduleData.info);
                        this._createNode(className, reslove);
                        EventManager.dispatchEventWith(EUIManager.HIDE_LOADING)
                        // Manager.uiLoading.hide();
                    })
                    .catch((reason) => {
                        moduleData.isLoaded = true;
                        cc.error(reason);
                        this.close(module);
                        moduleData.doCallback(null, className, "打开界面异常");
                        reslove(null);
                        let uiName = "";
                        if (CC_DEBUG) { uiName = className }
                        if (opt.ModuelConfig.name) { uiName = opt.ModuelConfig.name }
                        EventManager.dispatchEventWith(EUIManager.HIDE_LOADING)
                        // Manager.tips.show(`加载界面${uiName}失败，请重试`);
                        // Manager.uiLoading.hide();
                    });
            }
        })
    }

    private _createNode(className: string, reslove: Function): void {
        let moduleData = this._moduleDatas.get(className)
        if (!moduleData) { return }
        moduleData.isLoaded = true
        if (moduleData.status == ModuleStatusEnum.WAITTING_CLOSE) {
            //加载过程中有人关闭了界面
            reslove(null);
            if (CC_DEBUG) cc.warn(`[${this._logtag}]`, `${className}正等待关闭`);
            //如果此时有地方正在获取界面，直接返回空
            moduleData.doCallback(null, className, "获取界内已经关闭");
            return;
        }

        let uiNode: cc.Node = cc.instantiate(moduleData.info.data as cc.Prefab);
        moduleData.node = uiNode;
        let view = this._addComponent(uiNode, moduleData);
        if (!view) { return reslove(null) }
        if (moduleData.status == ModuleStatusEnum.WATITING_HIDE) {
            //加载过程中有人隐藏了界面
            view.hide({ onHided: () => { moduleData.ViewData.hided && moduleData.ViewData.hided() } });
            if (CC_DEBUG) { cc.warn(`[${this._logtag}]`, `加载过程隐藏了界面${className}`) }
            reslove(view);
            moduleData.doCallback(view, className, "加载完成，但加载过程中被隐藏")
        } else {
            if (CC_DEBUG) cc.log(`[${this._logtag}]`, `正在打开module: ${className}`)

            if (!moduleData.isPreload) {
                view.show({ data: moduleData.ViewData.data, onShowed: () => { moduleData.ViewData.showed && moduleData.ViewData.showed() } })
            }
            reslove(view)
            moduleData.doCallback(view, className, "加载完成，回调之前加载中的界面");
        }

    }

    private _addComponent(uiNode: cc.Node, moduleData: ModuleData): ModuleComponent | null {
        if (!uiNode) { return null }
        //挂载脚本
        let component: ModuleComponent = uiNode.getComponent(ModuleComponent);
        if (!component) {
            component = uiNode.addComponent(moduleData.ViewData.component);
            if (!component) {
                if (CC_DEBUG) { cc.error(`[${this._logtag}]`, `挂载脚本失败 : ${moduleData.loadData.name}`); }
                return null
            } else {
                if (CC_DEBUG) cc.log(`[${this._logtag}]`, `挂载脚本 : ${moduleData.loadData.name}`);
            }
        }

        // view.className = viewdata.loadData.name;
        component.bundle = moduleData.ViewData.bundle;
        moduleData.component = component;

        //界面显示在屏幕中间
        let widget = component.getComponent(cc.Widget);
        if (widget) {
            if (CC_DEBUG) { cc.warn(`[${this._logtag}]`, `你已经添加了cc.Widget组件，将会更改成居中模块`); }
            widget.isAlignHorizontalCenter = true;
            widget.horizontalCenter = 0;
            widget.isAlignVerticalCenter = true;
            widget.verticalCenter = 0;
        } else {
            widget = component.addComponent(cc.Widget);
            widget.isAlignHorizontalCenter = true;
            widget.horizontalCenter = 0;
            widget.isAlignVerticalCenter = true;
            widget.verticalCenter = 0;
        }
        if (!moduleData.isPreload) { this.addChild(uiNode, moduleData.ViewData.layer, moduleData.ViewData.zIndex, component) }
        return component
    }

    private loadPrefab(bundle: IResource.BUNDLE_TYPE, url: string, progressCallback: (completedCount: number, totalCount: number, item: any) => void) {
        return new Promise<cc.Prefab>((resolove, reject) => {
            if (bundle == undefined || bundle == "" || bundle == null) { bundle = BUNDLE_RESOURCES }
            AssetsManager.Instance.load(
                bundle, url, cc.Prefab, progressCallback,
                (data: IResource.ResourceCacheData) => {
                    if (data && data.data && data.data instanceof cc.Prefab) {
                        resolove(data.data)
                    } else {
                        reject(`加载prefab : ${url} 失败`)
                    }
                }
            );
        });
    }

    private _getNewModuleData(module: IUIClass<ModuleComponent>, opt: IShowModuleOption, className: string, isPreload: boolean) {
        let moduleData = new ModuleData();
        let prefabUrl = module.getPrefabUrl();

        moduleData.isPreload = isPreload;
        moduleData.loadData.name = className

        moduleData.ViewData.prefabUrl = prefabUrl
        moduleData.ViewData.bundle = opt.ModuelConfig.bundle
        moduleData.ViewData.component = module
        moduleData.ViewData.showed = opt.onShowed
        moduleData.ViewData.layer = opt.ModuelConfig.layer
        moduleData.ViewData.zIndex = opt.ModuelConfig.zIndex
        moduleData.ViewData.data = opt.data
        this._moduleDatas.set(className, moduleData);
        return moduleData
    }

    private _openByViewData(viewData: ModuleData, opt: IShowModuleOption, isPreload: boolean, reslove) {
        if (viewData.isLoaded) {
            viewData.status = ModuleStatusEnum.WAITTING_NONE;
            if (!isPreload) {
                if (viewData.component && cc.isValid(viewData.node)) {
                    viewData.node.zIndex = opt.ModuelConfig.zIndex;
                    if (!viewData.node.parent) { this.addChild(viewData.node, opt.ModuelConfig.layer, opt.ModuelConfig.zIndex, viewData.component); }

                    viewData.component.show({
                        data: opt.data,
                        onShowed: () => {
                            if (CC_DEBUG) { cc.log(`[${this._logtag}]`, `打开 module 完成`) }
                            opt.onShowed && opt.onShowed()
                        }
                    });
                }
            }
            return reslove(viewData.component);
        } else {
            viewData.status = ModuleStatusEnum.WAITTING_NONE;
            //if (!isPreload)  Manager.uiLoading.show(delay, name); }
            if (CC_DEBUG) cc.warn(`[${this._logtag}]`, `${viewData.loadData.name} 正在加载中...`);
            viewData.finishCb.push(reslove);
            return;
        }
    }

    public addChild(node: cc.Node, layer: number = 0, zIndex: number = 0, adpater: any = null) {
        if (!node) { return }
        LayerManager.Instance.getLayer(layer)!.addChild(node, zIndex)
        // resolutionHelper.fullScreenAdapt(node, adpater)
    }

    public checkView(url: string, className: string) {
        if (CC_DEBUG && className) {
            this.getView(className).then((view) => {
                if (!view) {
                    let viewData = this.getViewData(className)
                    if (viewData) {
                        //预置加载返回的view是空
                        //排除掉这种方式的
                        if (!viewData.isPreload) {
                            cc.error(`[${this._logtag}]`, `资源 : ${url} 的持有者必须由UIManager.open方式打开`)
                        }
                    } else {
                        cc.error(`[${this._logtag}]`, `资源 : ${url} 的持有者必须由UIManager.open方式打开`)
                    }
                }
            });
        }
    }

    public getView(className: string): Promise<any>;
    public getView(module: IUIClass<ModuleComponent>): Promise<ModuleComponent>;
    public getView(data: any): any {
        return new Promise<any>((reslove, reject) => {
            if (data == undefined || data == null) { return reslove(null) }
            let viewData = this.getViewData(data)
            if (viewData) {
                if (viewData.isPreload) {
                    //如果只是预加载，返回空，让使用者用open的方式打开
                    reslove(null)
                } else {
                    if (viewData.isLoaded) {
                        reslove(viewData.component)
                    } else {
                        //加载中
                        viewData.getViewCb.push(reslove)
                    }
                }
            } else { reslove(null) }
        });
    }

    private _moduleDatas: Map<string, ModuleData> = new Map<string, ModuleData>();
    private getViewData(className: string): ModuleData;
    private getViewData(module: IUIClass<ModuleComponent>): ModuleData;
    private getViewData(data: any): ModuleData {
        let className = this.getClassName(data)
        if (!className) { return null }
        let module = this._moduleDatas.has(className) ? this._moduleDatas.get(className) : null
        return module
    }


    public getClassName(className: string): string;
    public getClassName(module: IUIClass<ModuleComponent>): string;
    public getClassName(data: any): string {
        if (!data) { return null }
        let className: string = null
        if (typeof data == "string") {
            className = data
        } else {
            className = cc.js.getClassName(data)
        }
        return className
    }

    public close(module: IUIClass<ModuleComponent>);
    public close(className: string);
    public close(data: any) {
        //当前所有界面都已经加载完成
        let module = this.getViewData(data);
        if (module) {
            module.status = ModuleStatusEnum.WAITTING_CLOSE;
            if (module.component && cc.isValid(module.node)) {
                module.component.close()
                module.node.removeFromParent(true)
                module.node.destroy()
            }
            module.loadData.clear()
            let className = this.getClassName(data)
            AssetsManager.Instance.releaseAsset(module.info)
            this._moduleDatas.delete(className)
            cc.log(`[${this._logtag}]   close module : ${className}`)
        }
    }

    public hide(opt: IHideModuleOption) {
        let module = this.getViewData(opt.ModuelConfig.component)
        if (module) {
            if (module.isLoaded) {
                //已经加载完成，说明已经是直实存在的界面，按照正常游戏进行删除
                if (module.component && cc.isValid(module.component.node)) {
                    module.component.hide({
                        onHided: () => {
                            if (CC_DEBUG) { cc.log(`[${this._logtag}]`, `被隐藏的module`) }
                            opt.onHided && opt.onHided()
                        }
                    });
                }
                if (CC_DEBUG) { cc.log(`[${this._logtag}]`, `hide view : ${module.loadData.name}`) }
            } else {
                //没有加载写成，正常加载中
                module.ViewData.hided = opt.onHided
                module.ViewData.data = opt.data
                module.status = ModuleStatusEnum.WATITING_HIDE;
            }
        }
    }
}