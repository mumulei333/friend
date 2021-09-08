import { ModuleComponent, ModuleShowOption, ModuleHideOption } from "../../../../script/Framework/Component/ModuleComponent"

const { ccclass } = cc._decorator

@ccclass
export default class GameTwoModule extends ModuleComponent {
    static getPrefabUrl() { return "prefabs/GameTwoModule" }
    show(option: ModuleShowOption): void { option.onShowed() }
    hide(option: ModuleHideOption) { option.onHided() }



    onLoad() {
        let goBack = this.find("goBack")
        goBack.on(cc.Node.EventType.TOUCH_END, this._goBack, this)
    }

    private _goBack() {
        manager.enteyManager.stopGameEntry("GameTwoGameEntry")
    }
}