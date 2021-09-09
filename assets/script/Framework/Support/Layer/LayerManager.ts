import { Macro } from "../../Config/Macro";
import { LayerEnum } from "../../Defineds/Enums/LayerEnum";

export class LayerManager {
    private static _instance: LayerManager = null!;
    public static get Instance() { return this._instance || (this._instance = new LayerManager()); }

    private _layers: cc.Node[] = []

    constructor() {
        if (Macro.EnableLayerManager) { this._creatLayers() }
    }

    private _creatLayers(): void {
        this._layers.length = 0
        let parentNode = cc.director.getScene()?.getChildByName("Canvas")!
        let size = cc.view.getCanvasSize()
        for (let i = 0; i < LayerEnum.GameLayerNames.length; i++) {
            let node: cc.Node = parentNode.getChildByName(LayerEnum.GameLayerNames[i]) as any
            if (node == null) {
                node = new cc.Node()
                node.setContentSize(size)
                parentNode.addChild(node)
                this._addWidget(node)
                // Manager.resolutionHelper.fullScreenAdapt(node);
            }
            node.name = LayerEnum.GameLayerNames[i]
            this._layers.push(node)
        }
    }

    private _addWidget(view: cc.Node) {
        let widget = view.addComponent(cc.Widget);
        if (widget) {
            widget.isAlignHorizontalCenter = true;
            widget.horizontalCenter = 0;
            widget.isAlignVerticalCenter = true;
            widget.verticalCenter = 0;
            // widget.left = 0;
            // widget.right = 0;
            // widget.top = 0;
            // widget.bottom = 0;
        }
    }

    public getLayer(layerIndex: LayerEnum.GameLayer): cc.Node | null {
        if (Macro.EnableLayerManager) {
            return this._layers[layerIndex]
        } else {
            return this.getMainNode()
        }
    }

    private getMainNode(): cc.Node { return this.getCanvas() }


    public getCanvasComponent() {
        let rootScene = cc.director.getScene();
        let root = rootScene.getChildByName("Canvas");
        return root.getComponent(cc.Canvas)
    }

    public getCanvas(): cc.Node {
        let rootScene = cc.director.getScene();
        if (!rootScene) {
            if (CC_DEBUG) cc.error("[LayerManager]", `当前场景为空 ： ${cc.director.getScene().name}`);
            return null;
        }

        let root = rootScene.getChildByName("Canvas");
        if (!root) {
            if (CC_DEBUG) cc.error("[LayerManager]", `当前场景上找不到 Canvas 节点`);
            return null;
        }
        return root;
    }
}