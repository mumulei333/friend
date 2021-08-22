import { Reconnect } from "./framework/Support/Service/Reconnect";

const { ccclass, property, menu } = cc._decorator

@ccclass
@menu("MainController")
export default class MainController extends cc.Component {
    /**@description 进入后台的时间 */
    private _enterBackgroundTime = 0;

    onLoad() {
        Manager.resolutionHelper.onLoad(this.node)

        Manager.layer.onLoad()

        Manager.tips.preloadPrefab()
        Manager.uiLoading.preloadPrefab()
        Manager.loading.preloadPrefab()
        Manager.alert.preloadPrefab()
        Reconnect.preloadPrefab()

        Manager.serviceManager.onLoad()

        // //全局网络管理器onLoad
        Manager.netManager.onLoad(this.node);
        // //大厅
        // Manager.hallNetManager.onLoad(this.node);

        Manager.logicManager.onLoad(this.node);

        cc.game.on(cc.game.EVENT_HIDE, this.onEnterBackground, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onEnterForgeground, this);
    }

    update() {
        Manager.serviceManager.update()

        Manager.assetManager.remote.update()
    }

    onDestroy() {
        Manager.resolutionHelper.onDestroy();

        //网络管理器onDestroy
        Manager.netManager.onDestroy(this.node);

        // Manager.hallNetManager.onDestroy(this.node);
        //移除键盘事件
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP);

        //移除游戏事件注册
        cc.game.off(cc.game.EVENT_HIDE);
        cc.game.off(cc.game.EVENT_SHOW);

        Manager.serviceManager.onDestroy();

        //逻辑管理器
        Manager.logicManager.onDestroy(this.node);
    }

    private onEnterBackground() {
        this._enterBackgroundTime = Date.timeNow();
        cc.log(`[MainController]`, `onEnterBackground ${this._enterBackgroundTime}`);
        // Manager.globalAudio.onEnterBackground();
        Manager.serviceManager.onEnterBackground();
    }

    private onEnterForgeground() {
        let now = Date.timeNow();
        let inBackgroundTime = now - this._enterBackgroundTime;
        cc.log(`[MainController]`, `onEnterForgeground ${now} background total time : ${inBackgroundTime}`);
        // Manager.globalAudio.onEnterForgeground(inBackgroundTime);
        Manager.serviceManager.onEnterForgeground(inBackgroundTime);
    }
}