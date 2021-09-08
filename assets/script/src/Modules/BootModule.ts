import { ModuleComponent, ModuleHideOption, ModuleShowOption } from "../../Framework/Component/ModuleComponent";
import { ModuleEvent } from "../../Framework/Support/Event/ModuleEvent";
import { MainEvents } from "../Events/MainEvents";


const { ccclass } = cc._decorator
@ccclass
export default class BootModule extends ModuleComponent {
    static getPrefabUrl() { return "prefabs/BootModule" }

    show(option: ModuleShowOption): void { option.onShowed() }
    hide(option: ModuleHideOption) { option.onHided() }

    private _info: cc.Label = null
    onLoad() {
        this._info = this.getComByPath(cc.Label, "info")
        this._checkPlatform()
    }

    private _checkPlatform() {
        this._info.string = "正在检查当前运行环境"
        this.scheduleOnce(() => {
            if (manager.isBrower) { this._Web() }
            else { this._native() }
        }, 0.5)
    }

    private _Web() {
        this.scheduleOnce(() => {
            this._info.string = "正在获取系统公告"
            this._joinLoginOrMain()
        }, 0.5)
    }


    private _native() {
        this.scheduleOnce(() => {
            this._info.string = "正在初始化版本信息"
            this._joinLoginOrMain()
        }, 0.5)

    }


    private _joinLoginOrMain() {
        //如果登录 就直接进入主界面,
        //未登录进入登陆界面
        this.scheduleOnce(() => {
            this._info.string = "正在进入游戏界面"
            dispatchModuleEvent(ModuleEvent.SHOW_MODULE, MainEvents.LOGIN_MODULE, {
                onShowed: () => {
                    dispatchModuleEvent(ModuleEvent.CLOSE_MODULE, MainEvents.BOOT_MODULE)
                }
            })
        }, 1)

    }

    //主包检查更新应该是只有一次
    //checkUpdate() { manager.hotupdateManager.checkUpdate(this._test, null) }
    Hello(paramA: string, paramB: string) {
        console.log("Hello", paramA, paramB)
    }

    click() {
        // HotUpdateManager.checkUpdate({
        //     name: "",
        //     updateCallback: this._test.bind(this),
        //     isSkip: false,
        //     isMain: true,
        //     updateAddress: "http://192.168.3.151/hotupdate",
        //     manifestRoot: "manifest"
        // })
    }

    // private _test(code: HotUpdateEnums.Code, state: HotUpdateEnums.State) {
    //     if (code == HotUpdateEnums.Code.ALREADY_UP_TO_DATE && state == HotUpdateEnums.State.UP_TO_DATE) {
    //         manager.eventManager.dispatchEventWith("LOGIN_PANEL")
    //         // manager.enteyManager.getGameEntry("MainGameEntry")
    //     }
    //     console.log("======================================>", code, state)
    // }

}