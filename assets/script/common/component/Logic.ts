import { Resource } from "../../framework/Support/AssetManager/Interfaces";
import ResourceLoader from "../../framework/Support/AssetManager/ResourceLoader";
import { EventComponent } from "../../framework/Support/Components/EventComponent";
import { GameConfig } from "../Config/GameConfig";
import { LogicType, LogicEventData } from "../Event/LogicEvent";

export class Logic extends EventComponent {

    protected logTag = `[Logic]`;
    protected _loader: ResourceLoader = null;

    protected logicType: LogicType = LogicType.UNKNOWN;
    protected language: LanguageDataSourceDelegate = null;

    constructor() {
        super();

        this._loader = new ResourceLoader();

        //绑定加载器获取资源的回调
        this._loader.getLoadResources = this.getLoadResources.bind(this);
        //绑定加载器加载资源完成回调
        this._loader.onLoadComplete = this.onLoadResourceComplete.bind(this);
        this._loader.onLoadProgress = this.onLoadResourceProgress.bind(this);
    }

    protected get bundle(): string {
        cc.error(`请子类重写protected get bundle,返回游戏的包名,即 asset bundle name`);
        return "";
    }

    /**@description 进入各模块完成回调 */
    public onEnterComplete(data: LogicEventData) {

    }

    public init(data: cc.Node) {
        if (this.logicType == LogicType.UNKNOWN) {
            cc.error(`未对正确的对logicType赋值`);
        }
        this.node = data;
    }

    public onLoad() {
        if (!!this.bundle) {
            GameConfig.assetBundle[`${this.bundle}`] = this.bundle;
        } else {
            cc.error(`请子类重写protected get bundle,返回游戏的包名,即 asset bundle name`);
        }
        super.onLoad();
    }

    public onDestroy() {
        super.onDestroy();
        this.node = null;
    }

    /**@description 获取需要加载的资源 */
    protected getLoadResources(): Resource.ResourceData[] {
        return [];
    }

    /**@description 资源加载完成 */
    protected onLoadResourceComplete(err: Resource.ResourceLoaderError) {
    }

    /**@description 资源加载中 */
    protected onLoadResourceProgress(loadedCount: number, total: number, data: Resource.ResourceCacheData) {
    }


    /**@description 返回当前网络控制器类型Controller子类 */
    protected getNetControllerType(): any {
        return null;
    }

    //移除网络组件
    protected removeNetComponent() {
        let type = this.getNetControllerType()
        if (type) {
            if (this.node.getComponent(type)) {
                this.node.removeComponent(type)
                Manager.gameController = null;
            }
        }
    }

    //添加网络组件
    protected addNetComponent() {
        let type = this.getNetControllerType()
        if (type) {
            let controller = this.node.getComponent(type);
            if (!controller) {
                controller = this.node.addComponent(type);
            }
            Manager.gameController = controller;
            return controller;
        }
        return null;
    }
}