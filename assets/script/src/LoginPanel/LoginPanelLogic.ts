import { Logic } from "../../Common/Component/Logic";
import { LogicEvent, LogicEventData, LogicType } from "../../Common/Event/LogicEvent";
import { i18n } from "../../Common/Language/CommonLanguage";
import DownloadLoading from "../../Common/Support/DownloadLoading/DownloadLoading";
import { HotUpdate, AssetManagerCode, AssetManagerState } from "../../Common/Support/HotUpdate/HotUpdate";
import { ViewZOrder, GameLayer } from "../../framework/Config/Config";
import { BUNDLE_RESOURCES } from "../../framework/Support/AssetManager/Defined";
import { PinusGameService } from "../Net/Pinus/PinusGameService";
import { EchoService } from "../Net/websocketTest/websocket";
import LoginView from "./View/LoginView";

class LoginPanelLogic extends Logic {
    logicType: LogicType = LogicType.LOGIN;

    get bundle() { return BUNDLE_RESOURCES }

    protected bindUIEvent() {
        super.bindUIEvent()
        this.addUIEvent(LogicEvent.ENTER_LOGIN, this.onEnterComplete)
    }

    onLoad() {
        super.onLoad()
        this.onEnterLogin()
    }

    private onEnterLogin() {
        Manager.loading.show(i18n.checkingUpdate);
        HotUpdate.checkHallUpdate((code, state) => {
            if (code == AssetManagerCode.NEW_VERSION_FOUND || state == AssetManagerState.TRY_DOWNLOAD_FAILED_ASSETS) {
                //有新版本
                cc.log(`提示更新`);
                Manager.loading.hide();
                Manager.alert.show({
                    text: i18n.newVersion, confirmCb: (isOK) => {
                        if (isOK) {
                            let opt: UI.UIOpenOption = {
                                zIndex: ViewZOrder.UI,
                                layer: GameLayer.Content,
                                args: [state, i18n.hallText]
                            }
                            Manager.uiManager.open(DownloadLoading, opt);
                        } else {
                            //退出游戏
                            cc.game.end();
                        }
                    }
                });
            } else if (code == AssetManagerCode.ALREADY_UP_TO_DATE) {
                //已经是最新版本
                cc.log(`已经是最新版本`);
                Manager.loading.hide();
            } else if (code == AssetManagerCode.ERROR_DOWNLOAD_MANIFEST ||
                code == AssetManagerCode.ERROR_NO_LOCAL_MANIFEST ||
                code == AssetManagerCode.ERROR_PARSE_MANIFEST) {
                Manager.loading.hide();
                let content = i18n.downloadFailManifest;
                if (code == AssetManagerCode.ERROR_NO_LOCAL_MANIFEST) {
                    content = i18n.noFindManifest;
                } else if (code == AssetManagerCode.ERROR_PARSE_MANIFEST) {
                    content = i18n.manifestError;
                }
                Manager.tips.show(content);
            } else if (code == AssetManagerCode.CHECKING) {
                //当前正在检测更新
                cc.log(`正在检测更新!!`);
            } else {
                cc.log(`检测更新当前状态 code : ${code} state : ${state}`);
            }
        });
        Manager.uiManager.open(LoginView, { zIndex: ViewZOrder.zero, bundle: this.bundle });
    }


    public onEnterComplete(data: LogicEventData) {
        super.onEnterComplete(data);
        if (data.type == this.logicType) {
            EchoService.instance.connect()
            // Manager.serviceManager.onLoad()
            // PinusGameService.instance.connect()
            //进入到登录，关闭掉所有网络连接，请求登录成功后才连接网络
            // Manager.serviceManager.close();
        }
    }
}

if (!CC_EDITOR) { Manager.logicManager.push(LoginPanelLogic) }