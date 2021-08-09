import UIView from "../../framework/ui/UIView";
import { BundleConfig } from "../../common/base/HotUpdate";
import { LogicEvent, dispatchEnterComplete, LogicType } from "../../common/event/LogicEvent";
import { Config } from "../../common/config/Config";
import DownloadLoading from "../../common/component/DownloadLoading";
import { _decorator, Node, find, SystemEventType } from "cc";
import { PinusGameService } from "../../common/net/PinusGameService";
import { injectService } from "../../framework/decorator/Decorators";

const { ccclass, property } = _decorator;

@ccclass
@injectService(PinusGameService.instance)
export default class LoginView extends UIView {

    static getPrefabUrl() {
        return "login/prefabs/LoginView"
    }

    private _login: Node = null!;

    protected bindingEvents() {
        super.bindingEvents()
        this.addPomeloEvent("connector.entryHandler.enter", this.enter, true)
    }
    onLoad() {
        super.onLoad();

        this._login = find("login", this.node) as Node;
        this._login.on(SystemEventType.TOUCH_END, () => {
            pinus.request("connector.entryHandler.enter", { type: 3, extendFiel: {} })
            // 
        });

        // let version = cc.find("version", this.node).getComponent(cc.Label).string = "版本3";

        dispatchEnterComplete({ type: LogicType.LOGIN, views: [this, DownloadLoading] })
    }

    enter(data: any) {
        console.log("connector.entryHandler.enter", data)
        Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true));
    }
}
