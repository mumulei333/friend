import { _decorator, Camera, Component, find, instantiate, Node, Prefab, TiledMap, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapController')
export class MapController extends Component {


    @property({ type: Prefab })
    playerPrefab = null

    map: TiledMap;

    player: Node = null;


    start() {
        // 获取地图信息
        this.map = this.getComponent(TiledMap);
        // 普通层
        // this.map.getLayer();
        // 对象层
        let playerLayer = this.map.getObjectGroup("playerLayer");
        // 获取某个对象
        let playerObj = playerLayer.getObject("startPos");
        // 判断是否是玩家对象
        if (playerObj.isPlayer = true) {
            // 加载玩家预设体,创建玩家
            this.player = instantiate(this.playerPrefab);
            this.player.parent = this.node.children[2].children[0];
            this.player.active = true;
            this.player.position = v3(playerObj.x, 400);
        }
    }

    // 镜头聚焦主角(主角永远处于镜头中央)
    cameraFocus() {
        if (this.player != null) {
            let position_x = this.player.position.x;
            let position_y = this.player.position.y;
            find("Canvas/Camera").position = v3(position_x, position_y);
        }   
    }

    update(deltaTime: number) {
        this.cameraFocus();
    }

}

