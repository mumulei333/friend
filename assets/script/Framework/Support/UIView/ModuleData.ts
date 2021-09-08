import { ModuleComponent } from "../../Component/ModuleComponent";
import { ModuleStatusEnum } from "../../Defineds/Enums/ModuleStatusEnum";
import { IModuleDataLoadData } from "../../Defineds/Interfaces/IModuleDataLoadData";
import { IResource } from "../../Defineds/Interfaces/IResource";
import { ModuleDynamicLoadData } from "./ModuleDynamicLoadData";

/**@description 界面数据，这里需要处理一个问题，当一个界面打开，收到另一个人的关闭，此时如果界面未加载完成
 * 可能导致另一个人关闭无效，等界面加载完成后，又显示出来
 */
export class ModuleData {
    /**@description 界面是否已经加载 */
    isLoaded: boolean = false;
    /**@description 界面当前等待操作状态 */
    status: ModuleStatusEnum = ModuleStatusEnum.WAITTING_NONE;
    /**@description 实际显示界面 */
    component: ModuleComponent = null;
    /**@description 等待加载完成回调 */
    finishCb: ((view: any) => void)[] = [];
    /**@description 等待获取界面回调 */
    getViewCb: ((view: any) => void)[] = [];
    /**是否预加载,不显示出来，但会加到当前场景上 */
    isPreload: boolean = false;
    /**@description 资源信息 */
    info: IResource.ResourceInfo = null;

    ViewData: IModuleDataLoadData = {}




    /**@description 界面动态加载的数据 */
    loadData: ModuleDynamicLoadData = new ModuleDynamicLoadData();

    node: cc.Node = null;

    private doGet(view: ModuleComponent | null, className: string, msg: string) {
        for (let i = 0; i < this.getViewCb.length; i++) {
            let cb = this.getViewCb[i];
            if (cb) {
                cb(view);
                if (CC_DEBUG) { cc.warn(`[ViewData]`, `ViewData do get view : ${className} msg : ${msg}`); }
            }
        }

        this.getViewCb = [];
    }

    private doFinish(view: ModuleComponent | null, className: string, msg: string) {
        for (let i = 0; i < this.finishCb.length; i++) {
            let cb = this.finishCb[i];
            if (cb) {
                cb(view);
                if (CC_DEBUG) { cc.warn(`[ViewData]`, `ViewData do finish view : ${className} msg : ${msg}`); }
            }
        }
        this.finishCb = [];
    }

    doCallback(view: ModuleComponent | null, className: string, msg: string) {
        this.doFinish(view, className, msg);
        this.doGet(view, className, msg);
    }
}