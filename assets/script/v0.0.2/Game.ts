import { _decorator, BoxCollider, BoxCollider2D, Collider2D, Component, Contact2DType, director, EPhysics2DDrawFlags, ERigidBody2DType, ERigidBodyType, IPhysics2DContact, Node, physics, PhysicsSystem2D, RigidBody, RigidBody2D, TiledMap, TiledTile, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {


    @property({ type: TiledMap })
    titleMap = null;

    start() {
        
    
        let physicsSystem2D = PhysicsSystem2D.instance;
        physicsSystem2D.enable = true;
        physicsSystem2D.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        physicsSystem2D.gravity = v2(0,0);

        // PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
        // PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        
    
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
                    // collider.offset = v2(tiledSize.width / 2 - 192, tiledSize.height / 2 - 192);

                    collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);

                    collider.size = tiledSize;
                    collider.apply();
                }

            }

        }
    }


    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact:只在两个碰撞体开始接触时被调用一次');
    }
    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        console.log('onEndContact:只在两个碰撞体结束接触时被调用一次');
    }
    onPreSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 每次将要处理碰撞体接触逻辑时被调用
        // console.log('onPreSolve:每次将要处理碰撞体接触逻辑时被调用');
    }
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 每次处理完碰撞体接触逻辑时被调用
        // console.log('onPostSolve:每次处理完碰撞体接触逻辑时被调用');
    }





    update(deltaTime: number) {
        
    }
}

