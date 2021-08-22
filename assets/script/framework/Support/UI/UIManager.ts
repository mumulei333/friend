import { BUNDLE_RESOURCES } from "../AssetManager/Defined";
import { Resource } from "../AssetManager/Interfaces";
import { UIView, UIClass } from "../Components/UIView";
import { ViewStatus } from "./Defined";
/**
 * Create Time
 * 2021-08-19 18:56:38
 */
export class UIManager {
    private static _instance: UIManager = null;
    public static Instance(): UIManager {
        return this._instance || (this._instance = new UIManager());
    }
    private logTag = `[UIManager]`;

    /**@description 无主资源 */
    public garbage = new ViewDynamicLoadData(DYNAMIC_LOAD_GARBAGE);
    /**@description 驻留内存资源 */
    public retainMemory = new ViewDynamicLoadData(DYNAMIC_LOAD_RETAIN_MEMORY);

    public preload<T extends UIView>(uiClass: UIClass<T>, bundle: Resource.BUNDLE_TYPE) {
        return this._open(
            uiClass,
            {
                bundle: bundle,
                zIndex: 0,
                layer: 0,
                name: null,
                delay: null,
                args: null,
            },
            true
        );
    }

    public open<T extends UIView>(type: UIClass<T>, option: UI.UIOpenOption) {
        return this._open(
            type,
            {
                bundle: option.bundle,
                zIndex: option.zIndex ? option.zIndex : 0,
                layer: option.layer ? option.layer : 0,
                args: option.args,
                delay: option.delay,
                byPopup: option.byPopup,
            },
            false
        );
    }

    private loadPrefab(bundle: Resource.BUNDLE_TYPE, url: string, progressCallback: (completedCount: number, totalCount: number, item: any) => void) {
        return new Promise<cc.Prefab>((resolove, reject) => {
            if (bundle == undefined || bundle == "" || bundle == null) {
                bundle = BUNDLE_RESOURCES;
            }
            Manager.assetManager.load(
                bundle,
                url,
                cc.Prefab,
                progressCallback,
                (data: Resource.ResourceCacheData) => {
                    if (data && data.data && data.data instanceof cc.Prefab) {
                        resolove(data.data);
                    } else {
                        reject(`加载prefab : ${url} 失败`);
                    }
                }
            );
        });
    }

    private _open<T extends UIView>(uiCls: UIClass<T>, cfg: UI.UIOpenOption, isPreload: boolean) {
        let { bundle, zIndex, layer, args, delay, name, byPopup } = cfg;
        return new Promise<T>((reslove) => {
            if (!uiCls) {
                if (CC_DEBUG) {
                    cc.log(`${this.logTag}    open ui class error`);
                }
                return reslove(null);
            }
            let className = cc.js.getClassName(uiCls);
            let viewData = this.getViewData(uiCls);
            if (viewData) {
                viewData.isPreload = isPreload;
                if (viewData.isLoaded) {
                    viewData.status = ViewStatus.WAITTING_NONE;
                    if (!isPreload) {
                        if (viewData.view && cc.isValid(viewData.node)) {
                            viewData.node.zIndex = zIndex;
                            if (!viewData.node.parent) {
                                this.addChild({
                                    node: viewData.node,
                                    zIndex: zIndex,
                                    layer: layer,
                                    adpater: viewData.view,
                                });
                                // if (byPopup) { Manager.popupManager.popup(viewData.view) }
                            }

                            viewData.view.show({ data: args });
                        }
                    }
                    return reslove(<T>viewData.view);
                } else {
                    viewData.status = ViewStatus.WAITTING_NONE;
                    if (!isPreload) {
                        Manager.uiLoading.show(delay, name);
                    }
                    //正在加载中
                    if (CC_DEBUG) cc.warn(`${this.logTag}    ${className} 正在加载中...`);
                    viewData.finishCb.push(reslove);
                    return;
                }
            } else {
                viewData = new ViewData();
                viewData.loadData.name = className;
                let prefabUrl = uiCls.getPrefabUrl();
                viewData.isPreload = isPreload;
                this._viewDatas.set(className, viewData);

                let progressCallback: (
                    completedCount: number,
                    totalCount: number,
                    item: any
                ) => void = null;

                if (!isPreload) {
                    Manager.uiLoading.show(delay, name);
                    //预加载界面不显示进度
                    progressCallback = (
                        completedCount: number,
                        totalCount: number,
                        item: any
                    ) => {
                        let progress = Math.ceil((completedCount / totalCount) * 100);
                        Manager.uiLoading.updateProgress(progress);
                    };
                }
                this.loadPrefab(bundle, prefabUrl, progressCallback)
                    .then((prefab) => {
                        viewData.info = new Resource.ResourceInfo();
                        viewData.info.url = prefabUrl;
                        viewData.info.type = cc.Prefab;
                        viewData.info.data = prefab;
                        viewData.info.bundle = bundle;
                        Manager.assetManager.retainAsset(viewData.info);
                        this.createNode({
                            className: className,
                            uiClass: uiCls,
                            reslove: reslove,
                            data: prefab,
                            args: args,
                            zIndex: zIndex,
                            layerIndex: layer,
                            bundle: bundle,
                            byPopup: byPopup,
                        });
                        Manager.uiLoading.hide();
                    })
                    .catch((reason) => {
                        viewData.isLoaded = true;
                        cc.error(reason);
                        this.close(uiCls);
                        viewData.doCallback(null, className, "打开界面异常");
                        reslove(null);
                        let uiName = "";
                        if (CC_DEBUG) {
                            uiName = className;
                        }
                        if (name) {
                            uiName = name;
                        }
                        Manager.tips.show(`加载界面${uiName}失败，请重试`);
                        Manager.uiLoading.hide();
                    });
            }
        });
    }

    private createNode<T extends UIView>(opt: createOtion<T>) {
        let viewData = this._viewDatas.get(opt.className);
        viewData.isLoaded = true;
        if (viewData.status == ViewStatus.WAITTING_CLOSE) {
            //加载过程中有人关闭了界面
            opt.reslove(null);
            if (CC_DEBUG) cc.warn(`${this.logTag}    ${opt.className}正等待关闭`);
            //如果此时有地方正在获取界面，直接返回空
            viewData.doCallback(null, opt.className, "获取界内已经关闭");
            return;
        }

        let uiNode: cc.Node = cc.instantiate(opt.data);
        viewData.node = uiNode;
        let view = this._addComponent({
            uiNode: uiNode,
            uiClass: opt.uiClass,
            viewData: viewData,
            className: opt.className,
            zIndex: opt.zIndex,
            layerIndex: opt.layerIndex,
            args: opt.args,
            bundle: opt.bundle,
        });
        if (!view) {
            opt.reslove(null);
            return;
        }
        // if (opt.byPopup) { Manager.popupManager.popup(view) }

        if (viewData.status == ViewStatus.WATITING_HIDE) {
            //加载过程中有人隐藏了界面
            view.hide();
            if (CC_DEBUG)
                cc.warn(`${this.logTag}    加载过程隐藏了界面${opt.className}`);
            opt.reslove(view);
            viewData.doCallback(view, opt.className, "加载完成，但加载过程中被隐藏");
        } else {
            if (CC_DEBUG) cc.log(`${this.logTag}    open view : ${opt.className}`);

            if (!viewData.isPreload) {
                view.show({ data: opt.args });
            }
            opt.reslove(view);
            viewData.doCallback(
                view,
                opt.className,
                "加载完成，回调之前加载中的界面"
            );
        }
    }

    private _addComponent<T extends UIView>(opt: addComponentOption<T>) {
        if (opt.uiNode) {
            //挂载脚本
            let view = opt.uiNode.getComponent(opt.uiClass) as UIView;
            if (!view) {
                view = opt.uiNode.addComponent(opt.uiClass);
                if (!view) {
                    if (CC_DEBUG)
                        cc.error(`${this.logTag}  挂载脚本失败 : ${opt.className}`);
                    return null;
                } else {
                    if (CC_DEBUG) cc.log(`${this.logTag}    挂载脚本 : ${opt.className}`);
                }
            }

            view.className = opt.className;
            view.bundle = opt.bundle;
            opt.viewData.view = view;
            //去掉init函数，处理放在onLoad中，
            (<any>view)._args = opt.args;

            //界面显示在屏幕中间
            let widget = view.getComponent(cc.Widget);
            if (widget) {
                if (CC_DEBUG)
                    cc.warn(
                        `${this.logTag} 你已经添加了cc.Widget组件，将会更改成居中模块`
                    );
                widget.isAlignHorizontalCenter = true;
                widget.horizontalCenter = 0;
                widget.isAlignVerticalCenter = true;
                widget.verticalCenter = 0;
            } else {
                widget = view.addComponent(cc.Widget);
                widget.isAlignHorizontalCenter = true;
                widget.horizontalCenter = 0;
                widget.isAlignVerticalCenter = true;
                widget.verticalCenter = 0;
            }

            if (!opt.viewData.isPreload) {
                this.addChild({
                    node: opt.uiNode,
                    zIndex: opt.zIndex,
                    layer: opt.layerIndex,
                    adpater: view,
                });
            }
            return view;
        } else {
            return null
        }
    }

    //TODO 未完成
    public addChild(option: UI.addChildOption) {
        let { node, zIndex, layer, adpater } = option
        if (!node) { return }
        Manager.layer.getLayer(layer)!.addChild(node, zIndex)
        Manager.resolutionHelper.fullScreenAdapt(node, adpater)
    }

    public isShow(className: string): boolean;
    public isShow<T extends UIView>(uiClass: UIClass<T>): boolean;
    public isShow(data: any) {
        let viewData = this.getViewData(data);
        if (!viewData) {
            return false;
        }
        if (viewData.isLoaded && viewData.status == ViewStatus.WAITTING_NONE) {
            if (viewData.view) return viewData.view.node.active;
        }
        return false;
    }

    public close<T extends UIView>(uiClass: UIClass<T>);
    public close(className: string);
    public close(data: any) {
        //当前所有界面都已经加载完成
        let viewData = this.getViewData(data);
        if (viewData) {
            viewData.status = ViewStatus.WAITTING_CLOSE;
            if (viewData.view && cc.isValid(viewData.node)) {
                //Manager.popupManager.close(viewData.view)
                viewData.node.removeFromParent(true);
                viewData.node.destroy();
            }
            viewData.loadData.clear();
            let className = this.getClassName(data);
            Manager.assetManager.releaseAsset(viewData.info);
            this._viewDatas.delete(className);
            cc.log(`${this.logTag}    close view : ${className}`);
        }
    }

    private _viewDatas: Map<string, ViewData> = new Map<string, ViewData>();
    private getViewData(className: string): ViewData;
    private getViewData<T extends UIView>(uiClass: UIClass<T>): ViewData;
    private getViewData(data: any): ViewData {
        let className = this.getClassName(data);
        if (!className) return null;
        let viewData = this._viewDatas.has(className)
            ? this._viewDatas.get(className)
            : null;
        return viewData;
    }

    public getClassName(className: string): string;
    public getClassName<T extends UIView>(uiClass: UIClass<T>): string;
    public getClassName(data: any): string {
        if (!data) return null;
        let className = null;
        if (typeof data == "string") {
            className = data;
        } else {
            className = cc.js.getClassName(data);
        }
        return className;
    }

    /**@description 添加动态加载的本地资源 */
    public addLocal(info: Resource.ResourceInfo, className: string) {
        if (info) {
            let viewData = this.getViewData(className);
            if (viewData) {
                viewData.loadData.addLocal(info, className);
            }
        }
    }

    /**@description 添加动态加载的远程资源 */
    public addRemote(info: Resource.ResourceInfo, className: string) {
        if (info) {
            let viewData = this.getViewData(className);
            if (viewData) {
                viewData.loadData.addRemote(info, className);
            }
        }
    }

    /**@description 关闭除传入参数以外的所有其它界面,不传入，关闭所有界面 */
    public closeExcept(views: (UIClass<UIView> | string | UIView)[]) {
        let self = this;
        if (views == undefined || views == null || views.length == 0) {
            //关闭所有界面
            if (CC_DEBUG)
                cc.error(`请检查参数，至少需要保留一个界面，不然就黑屏了，大兄弟`);
            this._viewDatas.forEach((viewData: ViewData, key: string) => {
                self.close(key);
            });
            return;
        }

        let viewClassNames = new Set<string>();

        for (let i = 0; i < views.length; i++) {
            viewClassNames.add(this.getClassName(views[i] as any));
        }

        this._viewDatas.forEach((viewData: ViewData, key: string) => {
            if (viewClassNames.has(key)) {
                //如果包含，不做处理，是排除项
                return;
            }
            self.close(key);
        });

        this.printViews();
    }

    public printViews() {
        cc.log(`${this.logTag}---------views----start-----`);
        this._viewDatas.forEach((value: ViewData, key: string) => {
            cc.log(
                `[${key}] isLoaded : ${value.isLoaded} status : ${value.status
                } view : ${this.getClassName(value.view as any)} active : ${value.view && value.view.node ? value.view.node.active : false
                }`
            );
        });
        cc.log(`${this.logTag}---------views----end-----`);
    }

    public hide(className: string);
    public hide<T extends UIView>(uiClass: UIClass<T>);
    public hide(data: any) {
        let viewData = this.getViewData(data);
        if (viewData) {
            if (viewData.isLoaded) {
                //已经加载完成，说明已经是直实存在的界面，按照正常游戏进行删除
                if (viewData.view && cc.isValid(viewData.view.node)) {
                    viewData.view.hide();
                }
                if (CC_DEBUG)
                    cc.log(`${this.logTag}hide view : ${viewData.loadData.name}`);
            } else {
                //没有加载写成，正常加载中
                viewData.status = ViewStatus.WATITING_HIDE;
            }
        }
    }

    public getView(className: string): Promise<any>;
    public getView<T extends UIView>(uiClass: UIClass<T>): Promise<T>;
    public getView(data: any): any {
        return new Promise<any>((resolove, reject) => {
            if (data == undefined || data == null) {
                resolove(null);
                return;
            }
            let viewData = this.getViewData(data);
            if (viewData) {
                if (viewData.isPreload) {
                    //如果只是预加载，返回空，让使用者用open的方式打开
                    resolove(null);
                } else {
                    if (viewData.isLoaded) {
                        resolove(viewData.view);
                    } else {
                        //加载中
                        viewData.getViewCb.push(resolove);
                    }
                }
            } else {
                resolove(null);
            }
        });
    }

    public checkView(url: string, className: string) {
        if (CC_DEBUG && className) {
            this.getView(className).then((view) => {
                if (!view) {
                    let viewData = this.getViewData(className);
                    if (viewData) {
                        //预置加载返回的view是空
                        //排除掉这种方式的
                        if (!viewData.isPreload) {
                            cc.error(`资源 : ${url} 的持有者必须由UIManager.open方式打开`);
                        }
                    } else {
                        cc.error(`资源 : ${url} 的持有者必须由UIManager.open方式打开`);
                    }
                }
            });
        }
    }

    public fullScreenAdapt() {
        this._viewDatas.forEach((data) => {
            if (data.isLoaded && data.view) {
                Manager.resolutionHelper.fullScreenAdapt(data.view.node, data.view);
            }
        });
    }

    /*获取当前canvas的组件 */
    public getCanvasComponent(): cc.Component {
        return Manager.layer.getCanvas().getComponent("MainController");
    }

    public addComponent<T extends cc.Component>(type: { new(): T }): T;
    public addComponent(className: string): any;
    public addComponent(data: any) {
        let canvas = Manager.layer.getCanvas();
        if (canvas) {
            let component = canvas.getComponent(data);
            if (component) {
                if (typeof data == "string") {
                    if (CC_DEBUG)
                        cc.warn(`${this.logTag}已经存在 Component ${component}`);
                } else {
                    if (CC_DEBUG)
                        cc.warn(
                            `${this.logTag}已经存在 Component ${cc.js.getClassName(data)}`
                        );
                }
                return component;
            } else {
                return canvas.addComponent(data);
            }
        }
        return null;
    }

    public removeComponent(component: string | cc.Component) {
        let canvas = Manager.layer.getCanvas();
        if (canvas) canvas.removeComponent(component);
    }

    public printCanvasChildren() {
        cc.log(`${this.logTag}-----------printCanvasChildren--start-----------`);
        let canvas = Manager.layer.getCanvas();
        if (canvas) {
            let children = canvas.children;
            for (let i = 0; i < children.length; i++) {
                cc.log(`${children[i].name} active : ${children[i].active}`);
            }
        }
        cc.log(`${this.logTag}-----------printCanvasChildren--end-----------`);
    }

    public printComponent() {
        let canvas: any = Manager.layer.getCanvas();
        if (canvas) {
            let comps: any[] = canvas._components;
            cc.log(`${this.logTag} -------------- print component start --------------`);
            for (let i = 0; i < comps.length; i++) {
                cc.log(cc.js.getClassName(comps[i]));
            }
            cc.log(`${this.logTag} -------------- print component end --------------`);
        }
    }
}

interface addComponentOption<T extends UIView> {
    uiNode: cc.Node;
    uiClass: UIClass<T>;
    viewData: ViewData;
    className: string;
    zIndex: number;
    layerIndex: number;
    args: any[];
    bundle: Resource.BUNDLE_TYPE;
}

interface createOtion<T extends UIView> {
    className: string;
    uiClass: UIClass<T>;
    reslove: Function;
    data: cc.Prefab;
    args: any[];
    zIndex: number;
    layerIndex: number;
    bundle: Resource.BUNDLE_TYPE;
    byPopup: boolean;
}

/**@description 界面数据，这里需要处理一个问题，当一个界面打开，收到另一个人的关闭，此时如果界面未加载完成
 * 可能导致另一个人关闭无效，等界面加载完成后，又显示出来
 */
class ViewData {
    /**@description 界面是否已经加载 */
    isLoaded: boolean = false;
    /**@description 界面当前等待操作状态 */
    status: ViewStatus = ViewStatus.WAITTING_NONE;
    /**@description 实际显示界面 */
    view: UIView = null;
    /**@description 等待加载完成回调 */
    finishCb: ((view: any) => void)[] = [];
    /**@description 等待获取界面回调 */
    getViewCb: ((view: any) => void)[] = [];
    /**是否预加载,不显示出来，但会加到当前场景上 */
    isPreload: boolean = false;
    /**@description 资源信息 */
    info: Resource.ResourceInfo = null;

    /**@description 界面动态加载的数据 */
    loadData: ViewDynamicLoadData = new ViewDynamicLoadData();

    node: cc.Node = null;

    private doGet(view, className: string, msg: string) {
        for (let i = 0; i < this.getViewCb.length; i++) {
            let cb = this.getViewCb[i];
            if (cb) {
                cb(view);
                if (CC_DEBUG)
                    cc.warn(`ViewData do get view : ${className} msg : ${msg}`);
            }
        }

        this.getViewCb = [];
    }

    private doFinish(view, className: string, msg: string) {
        for (let i = 0; i < this.finishCb.length; i++) {
            let cb = this.finishCb[i];
            if (cb) {
                cb(view);
                if (CC_DEBUG)
                    cc.warn(`ViewData do finish view : ${className} msg : ${msg}`);
            }
        }
        this.finishCb = [];
    }

    doCallback(view, className: string, msg: string) {
        this.doFinish(view, className, msg);
        this.doGet(view, className, msg);
    }
}

class ViewDynamicLoadData {
    private local = new Map<string, Resource.ResourceInfo>();
    private remote = new Map<string, Resource.ResourceInfo>();
    public name: string;

    constructor(name: string = null) {
        this.name = name;
    }

    /**@description 添加动态加载的本地资源 */
    public addLocal(info: Resource.ResourceInfo, className: string = null) {
        if (info && info.url) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                cc.error(`找不到资源持有者: ${info.url}`);
            }
            if (CC_DEBUG) Manager.uiManager.checkView(info.url, className);
            if (!this.local.has(info.url)) {
                Manager.assetManager.retainAsset(info);
                this.local.set(info.url, info);
            }
        }
    }

    /**@description 添加动态加载的远程资源 */
    public addRemote(info: Resource.ResourceInfo, className: string = null) {
        if (info && info.data && !this.remote.has(info.url)) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                cc.error(`找不到资源持有者 : ${info.url}`);
            }
            if (CC_DEBUG) Manager.uiManager.checkView(info.url, className);
            Manager.cacheManager.remoteCaches.retainAsset(info);
            this.remote.set(info.url, info);
        }
    }

    /**@description 清除远程加载资源 */
    public clear() {
        if (this.name == DYNAMIC_LOAD_GARBAGE) {
            //先输出
            let isShow = this.local.size > 0 || this.remote.size > 0;
            if (isShow) {
                cc.error(`当前未能释放资源如下:`);
            }
            if (this.local && this.local.size > 0) {
                cc.error("-----------local-----------");
                if (this.local) {
                    this.local.forEach((info) => {
                        cc.error(info.url);
                    });
                }
            }
            if (this.remote && this.remote.size > 0) {
                cc.error("-----------remote-----------");
                if (this.remote) {
                    this.remote.forEach((info, url) => {
                        cc.error(info.url);
                    });
                }
            }
        } else {
            //先清除当前资源的引用关系
            if (this.local) {
                this.local.forEach((info) => {
                    Manager.assetManager.releaseAsset(info);
                });
                this.local.clear();
            }
            if (this.remote) {
                this.remote.forEach((info, url) => {
                    Manager.cacheManager.remoteCaches.releaseAsset(info);
                });
                this.remote.clear();
            }
        }
    }
}

/**@description 动态加载垃圾数据名 */
const DYNAMIC_LOAD_GARBAGE = "DYNAMIC_LOAD_GARBAGE";
/**@description 动画加载全局数据名 */
const DYNAMIC_LOAD_RETAIN_MEMORY = "DYNAMIC_LOAD_RETAIN_MEMORY";
// UIManager = UIManager