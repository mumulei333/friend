import { ModuleComponent, ModuleShowOption, ModuleHideOption } from "../../Framework/Component/ModuleComponent"
import { HotUpdateEnums } from "../../Framework/Defineds/Enums/HotUpdateEnums";
import { HotUpdateManager } from "../../Framework/Support/HotUpdate/HotUpdateManger";

const { ccclass } = cc._decorator
@ccclass
export default class LoginModule extends ModuleComponent {
    static getPrefabUrl() { return "prefabs/LoginModule" }
    show(option: ModuleShowOption): void { option.onShowed() }
    hide(option: ModuleHideOption) { option.onHided() }


    onLoad() {
        let login = this.find("login")
        login.on(cc.Node.EventType.TOUCH_END, this._joinHall, this)
    }

    private _joinHall() {
        // manager.eventManager.dispatchEventWith(MainEvents.OPEN_LOBBY_MODULE)
        // console.log(jsb.fileUtils.isFileExist("gameOne_version.manifest"))
        // if (jsb.fileUtils.isFileExist("gameOne_version.manifest")) {
        //     console.log(jsb.fileUtils.getStringFromFile("gameOne_version.manifest"))
        // }
        // console.log(jsb.fileUtils.isFileExist("gameOne_project.manifest"))
        HotUpdateManager.checkUpdate(this._test.bind(this), {
            name: "gameOne",
            isSkip: false,
            isMain: false,
            updateAddress: "http://192.168.3.151/hotupdate",
            manifestRoot: "manifest"
        })
    }
    private _test(code: HotUpdateEnums.Code, state: HotUpdateEnums.State) {
        if (code == HotUpdateEnums.Code.ALREADY_UP_TO_DATE && state == HotUpdateEnums.State.UP_TO_DATE) {
            manager.eventManager.dispatchEventWith("LOGIN_PANEL")
            // manager.enteyManager.getGameEntry("MainGameEntry")
        } else if (code == HotUpdateEnums.Code.NEW_VERSION_FOUND && state == HotUpdateEnums.State.READY_TO_UPDATE) {
            let updater = manager.hotupdateManager.getUpdater("gameOne")
            if (updater) {
                updater.runHotUpdate()
            }

        }
        console.log("======================================>", code, state)
    }
    private _onClick() {
        // manager.bundleManager.entryBundle(new BundleOption({
        //     name: "测试Bundle",
        //     bundleName: "testGameBundle",
        //     onComplete: () => {
        //         manager.enteyManager.startGameEntry("testGameEntry")
        //     }
        // }))
    }

}