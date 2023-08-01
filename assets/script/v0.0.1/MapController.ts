import { _decorator, Camera, Component, find, instantiate, Node, Prefab, TiledMap, UITransform, v3, Vec3 } from 'cc';
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
            this.player.parent = this.node.children[2];

            let localPos = find("Canvas/tiledMap").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(playerObj.x, playerObj.y));


            this.player.position = v3(localPos.x, localPos.y);
        }
    }


    update(deltaTime: number) {

    }

}

