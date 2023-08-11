import { _decorator, Animation, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, PhysicsSystem2D, RigidBody2D, Tween, tween, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Npc')
export class Npc extends Component {


    npc_id: number = 0;

    isInitComponent: boolean = false;

    // 目前是否在行走中
    isGoWalk: boolean = true;

    // 每次移动的距离
    travelDistance: number = 16;

    // npc行动范围
    minRandomPosition_x: number = 0;
    maxRandomPosition_x: number = 0;
    minRandomPosition_y: number = 0;
    maxRandomPosition_y: number = 0;

    state: string = 'hero_down';


    private timer: number = 0;
    private interval: number = 2; // 间隔时间，单位：秒

    // 当前正在的指令
    currentTween: Tween<Node> = null;    

    start() {

        let npcPosition_x = this.node.position.x;
        let npcPosition_y = this.node.position.y;
        // 每一次行走不能走出超过原始位置的屏幕
        this.minRandomPosition_x = npcPosition_x - 100
        this.maxRandomPosition_x = npcPosition_x + 100

        this.minRandomPosition_y = npcPosition_y - 100
        this.maxRandomPosition_y = npcPosition_y + 100

        // 主角与阻碍物平行走突然卡住问题，可以设置Collider2D.restitution回弹系数
        let boxCollider = this.node.getComponent(BoxCollider2D)
        boxCollider.on(Contact2DType.BEGIN_CONTACT, this.boxColliderOnBeginContact, this);

        // boxCollider.on(Contact2DType.PRE_SOLVE, this.boxColliderOnBeginContact, this);

    }


    boxColliderOnBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('boxColliderOnBeginContact:只在两个碰撞体开始接触时被调用一次: NPC角色触发碰撞');
        let nextLinearVelocity = this.node.getComponent(RigidBody2D).linearVelocity;
        nextLinearVelocity.x = 0;
        nextLinearVelocity.y = 0;
        this.node.getComponent(RigidBody2D).linearVelocity = nextLinearVelocity;
    }


    setState(state: string) {
        if (this.state == state) return;
        this.state = state;
        this.node.getComponent(Animation).play(this.state);
    }


     // 随机行走
     randomWalk() {
        if (!this.isGoWalk) {
            return;
        } else {
            console.log(`npc:${this.npc_id}, 开始随机行走。。。。`)
        }

        this.isGoWalk = false;
        
        let npcPosition_x = this.node.position.x;
        let npcPosition_y = this.node.position.y;

        let orientation = this.getRandomNumberInRange(0, 4);

        let linearVelocity_x = 0;
        let linearVelocity_y = 0;
        // 更新线速度行走
        if (orientation == 0) {
            // 假设往上走, 不能操作npc行动范围的最大值和最小值，如果超过就往反方向走。
            if (npcPosition_y + this.travelDistance > this.maxRandomPosition_y) {
                linearVelocity_y = - this.travelDistance;
                npcPosition_y -= this.travelDistance;
            } else {
                linearVelocity_y = this.travelDistance;
                npcPosition_y += this.travelDistance;
            }
            this.setState("npc_up")
        } else if (orientation == 1) {
            // 假设往下走
            if (npcPosition_y - this.travelDistance < this.minRandomPosition_y) {
                linearVelocity_y = this.travelDistance;
                npcPosition_y += this.travelDistance;
            } else {
                linearVelocity_y = - this.travelDistance;
                npcPosition_y -= this.travelDistance;
            }
            this.setState("npc_down")
        } else if (orientation == 2) {
            // 假设往左走
            if (npcPosition_x - this.travelDistance < this.minRandomPosition_x) {
                linearVelocity_x = this.travelDistance;
                npcPosition_x += this.travelDistance;
            } else {
                linearVelocity_x = - this.travelDistance;
                npcPosition_x -= this.travelDistance;
            }
            this.setState("npc_left")
        } else {
            // 假设往右走
            if (npcPosition_x + this.travelDistance > this.maxRandomPosition_x) {
                linearVelocity_x = - this.travelDistance;
                npcPosition_x -= this.travelDistance;
            } else {
                linearVelocity_x = this.travelDistance;
                npcPosition_x += this.travelDistance;
            }
            this.setState("npc_right")
        }

        
        console.log(`射线测试原：${this.node.position}`)
        console.log(`射线测试目标 x: ${npcPosition_x}, y: ${npcPosition_y}`)
        let raycast = PhysicsSystem2D.instance.raycast(this.node.position, v2(npcPosition_x, npcPosition_y));
        console.log(raycast)
        if (raycast.length != 0) {
            // let xxx = find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(raycast[0].point.x, raycast[0].point.y, 0))
            console.log("前面有狗挡着不能走")
        }

        tween(this.node)
        .call(() => {
            let linearVelocity = this.node.getComponent(RigidBody2D).linearVelocity;
            linearVelocity.x = linearVelocity_x;
            linearVelocity.y = linearVelocity_y;
            this.node.getComponent(RigidBody2D).linearVelocity = linearVelocity;
        })
        .delay(0.05)
        .call(() => {
            // 行走后重置
            let nextLinearVelocity = this.node.getComponent(RigidBody2D).linearVelocity;
            nextLinearVelocity.x = 0;
            nextLinearVelocity.y = 0;
            this.node.getComponent(RigidBody2D).linearVelocity = nextLinearVelocity;
        })
        .start();



        this.isGoWalk = true;
    }

    // 获取两数之间的随机数
    getRandomNumberInRange(min: number, max: number): number {
        // 计算区间的范围
        const range = max - min;
        // 计算随机数的偏移量
        const offset = Math.random() * range;
        // 计算最终的随机数，并加上最小值
        const randomNumber = min + offset;
        return Math.trunc(randomNumber);
    }

    


    update(deltaTime: number) {

        // if (this.npc_id != 0 && !this.isInitComponent) {

        // }

        // 每帧累加计时器
        this.timer += deltaTime;
        // 当计时器超过间隔时间时，执行方法并重置计时器
        if (this.timer >= this.interval) {
            this.timer = 0; // 重置计时器

            // 在这里调用你想要执行的方法
            this.randomWalk();
        }
        

        
    }
}

