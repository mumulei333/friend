import { entryResp, EntryResponse, PinusResponse, } from './../../Net/PinusTestMessage';
import { dispatchEnterComplete, LogicType } from "../../../Common/Event/LogicEvent";
import DownloadLoading from "../../../Common/Support/DownloadLoading/DownloadLoading";
import { setServiceByClassName, setServiceCodec } from "../../../framework/Decorator/Decorator";
import { UIView } from "../../../framework/Support/Components/UIView";
import { TestJsonMessage } from '../../Net/websocketTest/Message/testJsonMessage';
import { TestBinaryMessage } from '../../Net/websocketTest/Message/testBinaryMessage';

@setServiceByClassName("EchoService")
// @setServiceCodec(PomeloCodec)
export default class LoginView extends UIView {
    static getPrefabUrl() { return "LoginPanel/prefabs/LoginView" }

    protected bindUIEvent() {
        super.bindUIEvent()
    };

    protected bindNetEvent() {
        // this.addNetEvent("connector.entryHandler.enter", this.enter, entryResp, true)

        this.addNetEvent("1120", this.testBinary, TestBinaryMessage, true)
        // this.addNetEvent("120", this.testJSON, TestJsonMessage, true)
    }
    private _login: cc.Node = null;

    onLoad() {
        super.onLoad()
        this._login = cc.find("login", this.node);
        this._login.on(cc.Node.EventType.TOUCH_END, () => {
            let msg = new TestBinaryMessage()
            // let msg = new TestJsonMessage()
            // msg.msg = new entryHandler()
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
    testBinary(dat: TestBinaryMessage) {
        console.log(dat.user.float32)
        console.log(dat.hello)
    }
    testJSON(dat: TestJsonMessage) {
        console.log(dat)
    }

    enter(data: PinusResponse<EntryResponse>) {
        console.log(data)
        if (data.code != 0) {
            Manager.tips.show("与服务器通信发生问题")
        } else {
            // HallData.update(data.data)
            // Manager.bundleManager.enterBundle(new BundleConfig("大厅", Config.BUNDLE_HALL, 0, LogicEvent.ENTER_HALL, true))
        }
    }
}