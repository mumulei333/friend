const { ccclass } = cc._decorator
import { ModuleEvent } from "../Framework/Support/Event/ModuleEvent";
import { MainEvents } from "./Events/MainEvents";

@ccclass
export default class Main extends cc.Component {
    onLoad() {
        manager.popupControll.preloadPrefab()
        manager.processLoading.preloadPrefab()
        manager.enteyManager.startGameEntry("MainGameEntry")
        manager.enteyManager.addExclude("MainGameEntry")
        manager.eventManager.dispatchModuleEvent(ModuleEvent.SHOW_MODULE, MainEvents.BOOT_MODULE)
    }


    update() {
        manager.serviceManager.update()
        manager.assetsManager.remote.update()
    }
}