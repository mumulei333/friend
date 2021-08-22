import { Alert } from './Common/Component/Alert';
import { Loading } from './Common/Component/Loading';
import { Tips } from './Common/Component/Tips';
import UILoading from './Common/Component/UILoading';
import { BundleManager } from './Common/Manager/BundleManager';
import { LogicManager } from './Common/Manager/LogicManager';
import { NetManager } from './Common/Manager/NetManager';
import { Framework } from './framework/Framework';
import { Logger, LogLevel } from './framework/Log/Logger';
import Controller from './framework/Support/Components/Controller';
import { LayerManager } from './framework/Support/Layer/LayerManager';
import { getSingleton } from './framework/Extentions/getSingleton'
import { Buffer } from './Plugins/Buffer';
/**
 * 全局注册启动
 */
class _Statup extends Framework {
    get layer() { return getSingleton(LayerManager) }

    get alert() { return getSingleton(Alert) }

    get loading() { return getSingleton(Loading) }

    get tips() { return getSingleton(Tips) }

    get uiLoading() { return getSingleton(UILoading) }

    get logicManager() { return getSingleton(LogicManager) }

    get bundleManager() { return getSingleton(BundleManager) }

    gameController: Controller<any> = null

    private _netManager: NetManager = null

    get netManager() {
        if (!this._netManager) { this._netManager = new NetManager("NetManager") }
        return this._netManager
    }
    init() {

    }
}

(() => {
    console.log("startup")
    window.getSingleton = getSingleton
    Logger.logLevel = LogLevel.ERROR | LogLevel.LOG | LogLevel.WARN | LogLevel.DUMP;
    let app = new _Statup()
    Reflect.set(window, "Manager", app)
    Reflect.set(window, "buffer", Buffer)
    app.init()
})();


