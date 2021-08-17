import { HallData } from './../../../bundles/hall/script/data/HallData';
import { UIView } from "../../framework/ui/UIView";
import { BundleConfig } from "../../common/base/HotUpdate";
import { LogicEvent, dispatchEnterComplete, LogicType } from "../../common/event/LogicEvent";
import { Config } from "../../common/config/Config";
import DownloadLoading from "../../common/component/DownloadLoading";
import { PinusGameService } from "../../common/net/PinusGameServer";
import { injectService } from "../../framework/decorator/Decorators";

const { ccclass, property } = cc._decorator;

@ccclass
@injectService(PinusGameService.instance)
export default class LoginView extends UIView {

    static getPrefabUrl() {
        return "login/prefabs/LoginView"
    }

    private _login: cc.Node = null;

    protected bindingEvents() {
        super.bindingEvents()
        this.addPomeloEvent("connector.entryHandler.enter", this.enter, true)
    }

    onLoad() {
        super.onLoad();
        this._login = cc.find("login", this.node);
        this._login.on(cc.Node.EventType.TOUCH_END, () => {
            pomelo.request("connector.entryHandler.enter", { type: 3, extendFiel: {} })
            // Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true));
        });

        // let version = cc.find("version", this.node).getComponent(cc.Label).string = "版本3";

        dispatchEnterComplete({ type: LogicType.LOGIN, views: [this, DownloadLoading] })
    }
    enter(data: { code: number, data: any }) {
        if (data.code != 0) {
            Manager.tips.show("与服务器通信发生问题")
        } else {
            HallData.update(data.data)
            Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true))
        }
    }
}
