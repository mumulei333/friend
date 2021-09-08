import { PopupControll } from "./Common/Component/PopupControll";
import { ProcessLoading } from "./Common/Component/ProcessLoading";
import { VersionManager } from "./Common/Managers/PackageVersion/VersionManager";
import { EUIManager } from "./Framework/Defineds/Events/EUIManager";
import { Framework } from "./Framework/Framework";
import { EventOption } from "./Framework/Support/Event/EventOption";


/**
 * 初始化框架
 */
export class Application extends Framework {
    get isBrower() { return cc.sys.platform == cc.sys.WECHAT_GAME || CC_PREVIEW || cc.sys.isBrowser; }

    get popupControll() { return PopupControll.Instance }
    get processLoading() { return ProcessLoading.Instance }

    get versionManager() { return VersionManager.Instance }

    init() {
        super.init()
        this.eventManager.addEvent(this, EUIManager.SHOW_LOADING, this._showLoadingProgess)
        this.eventManager.addEvent(this, EUIManager.HIDE_LOADING, this._hideLodingProgess)
    }

    private _hideLodingProgess() { this.processLoading.hide() }
    private _showLoadingProgess(process: EventOption) { this.processLoading.show(process.data.progress + "%") }

}

(() => {
    if (CC_EDITOR) { return }
    window["manager"] = new Application()
    window["dispatchEventWith"] = (type: string, data?: any) => {
        manager.eventManager.dispatchEventWith(type, data)
    }

    window["dispatchModuleEvent"] = (type: string, moduleName: string, param?: { onHided?: () => void, onShowed?: (error?: Error) => void, data?: any }) => {
        manager.eventManager.dispatchModuleEvent(type, moduleName, param)
    }

    window["addEvent"] = (obj: any, type: string, fun: Function) => {
        manager.eventManager.addEvent(obj, type, fun)
    }
    manager.init()
})()