import { ModuleComponent } from "./Component/ModuleComponent"
import { getClassName } from "./Extentions/getClassName"
import { AssetsManager } from "./Support/Assets/AssetsManager"
import { CacheManager } from "./Support/Assets/CacheManager"
import { BundleManager } from "./Support/Bundler/BundleManager"
import { EntryManager } from "./Support/Entry/EntryManager"
import { EventManager } from "./Support/Event/EventManager"
import { ModuleEvent } from "./Support/Event/ModuleEvent"
import { HotUpdateManager } from "./Support/HotUpdate/HotUpdateManger"
import { LayerManager } from "./Support/Layer/LayerManager"
import { LocalStorage } from "./Support/LocalStorage/LocalStorage"
import { ModuleManager } from "./Support/Module/ModuleManager"
import { ServiceManager } from "./Support/NetWork/Manager/ServiceManager"
import { UIManager } from "./Support/UIView/UIManager"

export class Framework {
    public get uiManager() { return UIManager.Instance }

    public get layerManager() { return LayerManager.Instance }

    public get hotupdateManager() { return HotUpdateManager }

    public get bundleManager() { return BundleManager.Instance }

    public get enteyManager() { return EntryManager }

    public get eventManager() { return EventManager }

    public get assetsManager() { return AssetsManager.Instance }

    public get cacheManager() { return CacheManager }

    public get localStorage() { return LocalStorage.Instance }

    public get serviceManager() { return ServiceManager.Instance }

    public get moduleManager() { return ModuleManager }

    public init() {
        this.eventManager.addEvent(this, ModuleEvent.SHOW_MODULE, this._onShowModule)
        this.eventManager.addEvent(this, ModuleEvent.HIDE_MODULE, this._onHideModule)
        this.eventManager.addEvent(this, ModuleEvent.CLOSE_MODULE, this._onCloseModue)
    }

    private _onHideModule(dat: ModuleEvent) {
        if (!this.moduleManager.hasModule(dat.moduleName)) { return }
        let m = this.moduleManager.getModule(dat.moduleName)
        m.hide({
            onHided: () => { dat.onHided && dat.onHided() }
        })
    }


    private _onCloseModue(dat: ModuleEvent) {
        if (!this.moduleManager.hasModule(dat.moduleName)) { return }
        let m = this.moduleManager.getModule(dat.moduleName)
        this.moduleManager.removeModule(dat.moduleName)
        let name = getClassName(m)
        this.uiManager.close(name)
    }

    private _onShowModule(dat: ModuleEvent) {
        if (this.moduleManager.hasModule(dat.moduleName)) {
            let m: ModuleComponent = this.moduleManager.getModule(dat.moduleName)
            if (m.node.active == true || !m.node.isValid) { return }
            m.show({
                data: dat.data, onShowed: () => {
                    dat.onShowed && dat.onShowed()
                }
            })
        } else {
            let opt = this.moduleManager.getModuleOption(dat.moduleName)
            if (opt == null) {
                if (CC_DEBUG) {
                    cc.log("未注册的模块", dat.moduleName)
                }
                return
            }
            this.uiManager.openView({
                ModuelConfig: {
                    component: opt.component,
                    bundle: opt.bundle,
                    layer: opt.layer,
                    zIndex: opt.zIndex,
                    name: opt.name,
                },
                data: dat.data,
                onShowed: () => {
                    dat.onShowed && dat.onShowed()
                }
            }).then(view => {
                this.moduleManager.addModule(view, opt)
            })
        }
    }
}