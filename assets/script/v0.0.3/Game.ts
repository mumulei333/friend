import { _decorator, BoxCollider, BoxCollider2D, CircleCollider2D, Collider2D, Component, Contact2DType, director, EPhysics2DDrawFlags, ERigidBody2DType, ERigidBodyType, find, instantiate, IPhysics2DContact, math, Node, physics, PhysicsSystem, PhysicsSystem2D, Prefab, RigidBody, RigidBody2D, TiledLayer, TiledMap, TiledTile, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {


    @property({ type: Node })
    mapNode = null;


    @property({ type: Prefab })
    npcPrefab = null

    

    start() {
        
    
        let physicsSystem2D = PhysicsSystem2D.instance;
        physicsSystem2D.enable = true;
        physicsSystem2D.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        physicsSystem2D.gravity = v2(0,0);

        console.log(`PhysicsSystem2D.PhysicsGroup : ${JSON.stringify(PhysicsSystem2D.PhysicsGroup)}`)

    

        // PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
        // PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        
        for (let mapNode of this.mapNode.children) {
            let titleMap = mapNode.getComponent(TiledMap);

            let tiledSize = titleMap.getTileSize();
            let wallLayer = titleMap.getLayer('wall');
            let layerSize = wallLayer.getLayerSize();

            let smogLayer = titleMap.getLayer('smog');

            let playerLayer = titleMap.getObjectGroup("object_layer");
            // 获取某个对象
            let players = playerLayer.getObjects();

            this.objectLayerAddComponent(titleMap, players);
            
            // smogLayer.node.active = false;


            for (let x = 0; x < layerSize.width; x++) {
                for (let y = 0; y < layerSize.height; y++) {
                    this.wallLayerAddComponent(x, y, tiledSize, wallLayer);
                    // this.smogLayerAddComponent(x, y, tiledSize, smogLayer);
                }

            }
            
        }
    
        
    }

    objectLayerAddComponent(titleMap: TiledMap, players: any[]) {

        for (let x = 0; x < players.length; x++) {

            let playerObj = players[x];

            if (playerObj.npc == true) {

                // 00010:{10001}
                // 00100:{10002}
                // 01000:{10003}
                // 10000:{10004}
                // 11110:{10005}
                // 11111:{10006, 10007}



                // 调试npc坐标用的
                // if (playerObj.npc_id == '10005') {
                //     console.log(`中心地N坐标 x: ${playerObj.x}, y: ${playerObj.y}`)
                //     let wlocalPos = titleMap.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(playerObj.x, playerObj.y));
                //     let localPos = find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(wlocalPos.x, wlocalPos.y));
                //     console.log(`转canvas后的中心地N坐标 x: ${localPos.x}, y: ${localPos.y}`)
                // }

                // 加载npc预设体, 创建npc 10005 
                let npc = instantiate(this.npcPrefab);

                let wlocalPos = titleMap.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(playerObj.x, playerObj.y));
                let localPos = find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(wlocalPos.x, wlocalPos.y));

                console.log(`npc_id: ${playerObj.npc_id}, map_pos: {x: ${playerObj.x}, y: ${playerObj.y}}, wlocalPos: {x: ${wlocalPos.x}, y: ${wlocalPos.y}}, canvasPos: {x: ${localPos.x}, y: ${localPos.y}} `)

                // npc.position = v3(localPos.x / 2, localPos.y / 2);
                // npc.worldPosition = v3(x * 100, x * 100); // 测试位置用的
                npc.worldPosition = v3(playerObj.x - 192, playerObj.y - 192);
                npc.parent = titleMap.node.children[3];

                let body = npc.addComponent(RigidBody2D);
                body.type = ERigidBody2DType.Dynamic;
                body.group = 4;
                body.fixedRotation = true;
                body.gravityScale = 0;
    
                let collider = npc.addComponent(BoxCollider2D);
                collider.group = 4;
                // 刚体的实际位置
                // collider.offset = v2(npc.width / 2, npc.height / 2);
                collider.size.set(npc.width, npc.height);
                collider.apply();

            }
        }

    }





    wallLayerAddComponent(x: number, y: number, tiledSize: math.Size, wallLayer: TiledLayer) {
        let gid = wallLayer.getTileGIDAt(x, y);
        if (gid != 0) {
            // console.log(`x: ${x}, y: ${y}, GID: ${gid}`);
            
            let tiled = wallLayer.getTiledTileAt(x, y, true);
            let body = tiled.node.addComponent(RigidBody2D);
            body.type = ERigidBody2DType.Static;
            body.group = 2;

            let collider = tiled.node.addComponent(BoxCollider2D);
            collider.group = 2;
            // 刚体的实际位置
            collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
            collider.size = tiledSize;
            collider.apply();
        }
    }

    smogLayerAddComponent(x: number, y: number, tiledSize: math.Size, smogLayer: TiledLayer) {

        let gid = smogLayer.getTileGIDAt(x, y);
        if (gid != 0) {
            // console.log(`x: ${x}, y: ${y}, GID: ${gid}`);
            let tiled = smogLayer.getTiledTileAt(x, y, true);

            let body = tiled.node.addComponent(RigidBody2D);
            body.type = ERigidBody2DType.Static;
            body.group = 8;


            let collider = tiled.node.addComponent(BoxCollider2D);
            collider.group = 8;
            // 刚体的实际位置
            collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
            collider.size = tiledSize;
            // collider.apply();
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
        console.log('onPreSolve:每次将要处理碰撞体接触逻辑时被调用');
    }
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 每次处理完碰撞体接触逻辑时被调用
        console.log('onPostSolve:每次处理完碰撞体接触逻辑时被调用');
    }





    update(deltaTime: number) {
        
    }
}

