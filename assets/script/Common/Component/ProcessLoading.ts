//带进度显示的Loading

import { Layer } from "../../Framework/Defineds/Enums/Layer";

export class ProcessLoading {
    private static _instance: ProcessLoading = null!;
    public static get Instance() { return this._instance || (this._instance = new ProcessLoading()); }

    private _node: cc.Node = null
    private _loop: cc.Node = null
    private _text: cc.Label = null

    private _prefab: cc.Prefab = null

    public preloadPrefab() { this.loadPrefab() }

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
    private _initView() {
        if (this._prefab == null) { return }
        this._node = cc.instantiate(this._prefab)
        manager.uiManager.addChild(this._node, Layer.GameLayer.UILoading, 0)
        this._node.active = false

        this._loop = cc.find("content/icon", this._node)
        this._text = cc.find("content/text", this._node).getComponent(cc.Label)
    }


    public async show(info: string) {
        let finish = await this.loadPrefab()
        if (finish) {
            if (!this._node) { this._initView() }
            this._text.string = info
            if (this._node.active == true) { return }
            // manager.popupControll.show()
            this._node.active = true
            cc.Tween.stopAllByTarget(this._loop)
            let loop = cc.tween().to(0.5, { angle: -360 })
            cc.tween(this._loop).repeatForever(loop).start()
        }

    }

    public hide() {
        if (this._node) {
            if (this._node.active == false) { return }
            this._node.active = false
            this._text.string = ""
            cc.Tween.stopAllByTarget(this._loop)
        }
    }
}

const RESOURCES = "resources"
const VIEW_PATH = "common/prefabs/ProcessLoading"