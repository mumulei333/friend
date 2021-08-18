import { LogicEvent } from './../event/LogicEvent';
import { BUNDLE_RESOURCES } from "../../framework/base/Defines";
import Stack from "../../framework/extentions/Stack";
import { UIView } from "../../framework/ui/UIView";
import { Config, GameLayer, MaskConfig, ViewZOrder } from "../config/Config";

export class PopupManage {
    private static _instance: PopupManage = null!;
    public static Instance() { return this._instance || (this._instance = new PopupManage()); }

    private _node: cc.Node = null
    private _prefab: cc.Prefab = null

    public preloadPrefab() {
        if (!MaskConfig.Enable) { return }
        this.loadPrefab()
    }
    private async loadPrefab() {
        return new Promise<boolean>((resolve, reject) => {
            if (this._prefab) {
                resolve(true);
                return;
            } else {
                Manager.assetManager.load(
                    BUNDLE_RESOURCES,
                    Config.CommonPrefabs.mask,
                    cc.Prefab,
                    (finish, total, item) => { },
                    (data) => {
                        if (data && data.data && data.data instanceof cc.Prefab) {
                            Manager.assetManager.addPersistAsset(Config.CommonPrefabs.mask, data.data, BUNDLE_RESOURCES);
                            this._prefab = data.data;
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
            }
        });
    }


    private showMask() {
        if (!this._node) {
            this._initView()
        }
        if (this._node.active == true) { return }
        else {
            this._node.active = true
            cc.tween(this._node)
                .set({ opacity: 0 })
                .to(0.2, { opacity: MaskConfig.defaultOpacity })
                .start()
        }
    }
    private hideMask() {
        if (!this._node) { return }
        if (this._node.active == false) { return }
        cc.tween(this._node)
            .to(0.2, { opacity: 0 })
            .call(() => { this._node.active = false })
            .start()
    }

    private _initView() {
        this._node = cc.instantiate(this._prefab)
        Manager.uiManager.addChild(this._node, ViewZOrder.zero, GameLayer.Mask)
        this._node.active = false

        let btn = cc.find("single_color", this._node)

        btn.color = cc.Color.fromHEX(btn.color, MaskConfig.defaultColor)
        btn.on("click", this._onClose, this, true)

        Manager.resolutionHelper.fullScreenAdapt(this._node);
        Manager.eventDispatcher.addEventListener(LogicEvent.CHECK_OFF_MASK, this.isOffMask, this)
    }

    private _onClose() { this.close() }

    private _nodeStatck: Stack<UIView> = new Stack()

    public popup(ui: UIView) {
        if (!MaskConfig.Enable) { return }
        this.showMask()
        this._nodeStatck.push(ui)
    }

    public close(uiNode?: UIView) {
        if (!MaskConfig.Enable) { return }
        if (uiNode) {
            let idx = this._nodeStatck.indexOf(uiNode)
            if (idx != -1) {
                this._nodeStatck.del(idx)
                this.isOffMask()
            }
        } else {
            uiNode = this._nodeStatck.last()
            if (uiNode && uiNode.isMaskClose) {
                Manager.uiManager.close(uiNode.className)
                this._nodeStatck.pop()
                this.isOffMask()
            }
        }
    }

    private isOffMask() {
        if (this._nodeStatck.isEmpty()) { this.hideMask() }
    }
}