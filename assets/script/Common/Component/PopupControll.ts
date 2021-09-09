import { Macro } from "../../Framework/Config/Macro";
import { LayerEnum } from "../../Framework/Defineds/Enums/LayerEnum";
import { getClassName } from "../../Framework/Extentions/getClassName";
import Stack from "../../Libs/Stack";
import { Config } from "../Config/Config";
import PopupModule from "./PopupModule";



export class PopupControll {
    private static _instance: PopupControll = null!;
    public static get Instance() { return this._instance || (this._instance = new PopupControll()); }

    private _node: cc.Node = null
    private _prefab: cc.Prefab = null

    public preloadPrefab() {
        if (!Macro.EnableLayerManager) { return }
        this.loadPrefab()
    }
    private async loadPrefab() {
        return new Promise<boolean>((resolve, reject) => {
            if (this._prefab) {
                resolve(true);
                return;
            } else {
                manager.assetsManager.load(
                    RESOURCES,
                    VIEW_PATH,
                    cc.Prefab,
                    (finish, total, item) => { },
                    (data) => {
                        if (data && data.data && data.data instanceof cc.Prefab) {
                            manager.assetsManager.addPersistAsset(VIEW_PATH, data.data, RESOURCES);
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
        } else {
            if (this._node.active == true) { return }
            else {
                cc.tween(this._node)
                    .set({ active: true, opacity: 0 })
                    .to(0.2, { opacity: Config.defaultOpacity })
                    .start()
            }
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

    private async _initView() {
        let finish = await this.loadPrefab()
        if (finish) {
            this._node = cc.instantiate(this._prefab)
            manager.uiManager.addChild(this._node, LayerEnum.GameLayer.Mask, 0,)
            this._node.active = false

            let btn = cc.find("single_color", this._node)

            btn.color = cc.Color.fromHEX(btn.color, Config.defaultColor)
            btn.on("click", this._onClose, this, true)
            manager.eventManager.addEvent(this, CHECK_OFF_MASK, this.isOffMask)
            // Manager.resolutionHelper.fullScreenAdapt(this._node);
        }
    }

    private _onClose() { this.close() }

    private _nodeStatck: Stack<PopupModule> = new Stack()

    public popup(ui: PopupModule) {
        if (!Config.EnableMask) { return }
        this.showMask()
        this._nodeStatck.push(ui)
    }

    public show() {
        this.showMask()
    }

    public close(uiNode?: PopupModule) {
        if (!this._node) { return }
        if (!Config.EnableMask) { return }
        if (this._nodeStatck.isEmpty() && this._node.active == true && uiNode == null) {
            return this.isOffMask()
        }
        if (uiNode) {
            let idx = this._nodeStatck.indexOf(uiNode)
            if (idx != -1) {
                this._nodeStatck.del(idx)
                this.isOffMask()
            }
        } else {
            uiNode = this._nodeStatck.last()
            if (uiNode && uiNode.isMaskClose) {
                manager.uiManager.close(getClassName(uiNode))
                this._nodeStatck.pop()
                this.isOffMask()
            }
        }
    }

    private isOffMask() {
        if (this._nodeStatck.isEmpty()) { this.hideMask() }
    }
}

const RESOURCES = "resources"
const VIEW_PATH = "common/prefabs/MaskView"
export const CHECK_OFF_MASK = "CHECK_OFF_MASK" /**@description 检测Mask是否可以关闭 */

