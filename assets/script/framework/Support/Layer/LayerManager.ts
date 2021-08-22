import { GameConfig } from "../../../Common/Config/GameConfig";
import { GameLayerNames, GameLayer } from "../../Config/Config";

export class LayerManager {
    private static _instance: LayerManager = null!;
    public static Instance() { return this._instance || (this._instance = new LayerManager()); }
    public _logTag = `[LayoutManager]`;

    private _layers: cc.Node[] = []

    onLoad() {
        if (GameConfig.EnableLayerManager) {
            this._creatLayers()
        }
    }


    private _creatLayers(): void {
        this._layers.length = 0
        let parentNode = cc.director.getScene()?.getChildByName("Canvas")!
        let size = cc.view.getCanvasSize()
        for (let i = 0; i < GameLayerNames.length; i++) {
            let node: cc.Node = parentNode.getChildByName(GameLayerNames[i]) as any
            if (node == null) {
                node = new cc.Node()
                node.setContentSize(size)
                parentNode.addChild(node)
                this._addWidget(node)
                Manager.resolutionHelper.fullScreenAdapt(node);
            }
            node.name = GameLayerNames[i]
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

    public getLayer(layerIndex: GameLayer): cc.Node | null {
        if (GameConfig.EnableLayerManager) {
            return this._layers[layerIndex]
        } else {
            return this.getMainNode()
        }
    }

    private getMainNode(): cc.Node {
        return this.getCanvas()
    }


    public getCanvas(): cc.Node {
        let rootScene = cc.director.getScene();
        if (!rootScene) {
            if (CC_DEBUG) cc.error(`${this._logTag}当前场景为空 ： ${cc.director.getScene().name}`);
            return null;
        }

        let root = rootScene.getChildByName("Canvas");
        if (!root) {
            if (CC_DEBUG) cc.error(`${this._logTag}当前场景上找不到 Canvas 节点`);
            return null;
        }
        return root;
    }
}