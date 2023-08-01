import { _decorator, BoxCollider, BoxCollider2D, Component, director, EPhysics2DDrawFlags, ERigidBody2DType, ERigidBodyType, Node, physics, PhysicsSystem2D, RigidBody, RigidBody2D, TiledMap, TiledTile, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {


    @property({ type: TiledMap })
    titleMap = null;

    start() {
    
        let physicsSystem2D = PhysicsSystem2D.instance;
        physicsSystem2D.enable = true;
        // physicsSystem2D.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        physicsSystem2D.gravity = v2(0,0);
        
    
        let tiledSize = this.titleMap.getTileSize();
        let layer = this.titleMap.getLayer('wall');
        let layerSize = layer.getLayerSize();

        for (let x = 0; x < layerSize.width; x++) {

            for (let y = 0; y < layerSize.height; y++) {
                let gid = layer.getTileGIDAt(x, y);
                if (gid != 0) {
                    console.log(`x: ${x}, y: ${y}, GID: ${gid}`);
                    
                    let tiled = layer.getTiledTileAt(x, y, true);
                    tiled.node.group = 'wall';

                    let body = tiled.node.addComponent(RigidBody2D);
                    body.type = ERigidBody2DType.Static;
                    body.group = 2;

                    let collider = tiled.node.addComponent(BoxCollider2D);
                    collider.group = 2;
                    // 刚体的实际位置
                    collider.offset = v2(tiledSize.width / 2 - 192, tiledSize.height / 2 - 192);
                    collider.size = tiledSize;
                    collider.apply();
                }

            }

        }


    }

    update(deltaTime: number) {
        
    }
}

