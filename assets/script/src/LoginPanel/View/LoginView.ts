import { PinusTestMessageHeader } from './../../Net/PinusTestMessage';
import { dispatchEnterComplete, LogicType } from "../../../Common/Event/LogicEvent";
import DownloadLoading from "../../../Common/Support/DownloadLoading/DownloadLoading";
import { setServiceByClassName, setServiceMessageHeader } from "../../../framework/Decorator/Decorator";
import { UIView } from "../../../framework/Support/Components/UIView";
import { entryHandler, PinusTestMessage } from "../../Net/PinusTestMessage";
import { PomeloMessageHeader } from '../../../Common/Net/Pomelo/PomeloMessage';

@setServiceByClassName("PinusGameService")
@setServiceMessageHeader(PomeloMessageHeader)
export default class LoginView extends UIView {
    static getPrefabUrl() { return "LoginPanel/prefabs/LoginView" }

    protected bindUIEvent() {
        super.bindUIEvent()
    };

    protected bindNetEvent() {
        this.addNetEvent("connector.entryHandler.enter", this.enter, null, true)
    }
    private _login: cc.Node = null;

    onLoad() {
        super.onLoad()
        this._login = cc.find("login", this.node);
        this._login.on(cc.Node.EventType.TOUCH_END, () => {
            let msg = new PinusTestMessage()
            msg.msg = new entryHandler()
            this._service.send(msg)
            // Manager.uiManager.open({ type: SettingView, bundle: BUNDLE_RESOURCES, zIndex: ViewZOrder.UI, layerIndex: GameLayer.Alert, byPopup: true, name: "设置界面" });
            // pomelo.request("connector.entryHandler.enter", { type: 3, extendFiel: {} })
            // pomelo.notify("connector.entryHandler.enter", { type: 3, extendFiel: {} })
            // Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true));
        });
        dispatchEnterComplete({
            type: LogicType.LOGIN, views: [this, DownloadLoading]
        })

    }




    enter(data: any) {
        console.log(data)
        if (data.code != 0) {
            Manager.tips.show("与服务器通信发生问题")
        } else {
            // HallData.update(data.data)
            // Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true))
        }
    }
}