import { _decorator, Animation, BoxCollider2D, CircleCollider2D, Collider2D, Component, Contact2DType, find, IPhysics2DContact, Node, RigidBody2D, TiledTile, UIRenderer, v3 } from 'cc';
import { DisplacementInput } from './DisplacementInput';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {


    // 动画状态
    state: string;

    // 速度
    speed: number = 10;

    start() {

        // 主角与阻碍物平行走突然卡住问题，可以设置Collider2D.restitution回弹系数
        let boxCollider = this.node.getComponent(BoxCollider2D)
        boxCollider.on(Contact2DType.BEGIN_CONTACT, this.boxColliderOnBeginContact, this);

                
        let circleCollider = this.node.getComponent(CircleCollider2D)
        circleCollider.on(Contact2DType.BEGIN_CONTACT, this.circleColliderOnBeginContact, this);

        
    }

    boxColliderOnBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('boxColliderOnBeginContact:只在两个碰撞体开始接触时被调用一次');
    }

    circleColliderOnBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        // console.log('circleColliderOnBeginContact:只在两个碰撞体开始接触时被调用一次');

        // 这里处理的是两个物体碰撞但不阻挡的回调，设置Collider2D中的sensor属性即可只走回调不阻挡
        if (otherCollider.group == 8) {
            // console.log(otherCollider.node)
            // cocos Bug？挂载RigidBody2D的Node节点使用active设置隐藏报错, 
            // 由于我们这边在设置smog的挂载了RigidBody2D组件，所以不能用otherCollider.node.active = false;
            // 所以使用一下代码完成消除迷雾功能
            // 盒子外观消失
            otherCollider.node.setScale(0,0)
            // 刚体休眠(提高性能)
            otherCollider.node.getComponent(RigidBody2D).sleep();
            // 切换物理碰撞分组使其不再进行碰撞回调
            otherCollider.node.getComponent(BoxCollider2D).group = 0;
            // 归零gid
            otherCollider.node.getComponent(TiledTile).gid = 0;
        }

    }


    setState(state: string) {
        if (this.state == state) return;
        this.state = state;
        this.node.getComponent(Animation).play(this.state);
    }


    // 镜头聚焦猫(小猫永远处于镜头中央)
    cameraFocusCat() {
        let cameraNode = find("Canvas/Camera");
        let position_x = this.node.position.x;
        let position_y = this.node.position.y;

        let cameraPosition_x = cameraNode.position.x;
        let cameraPosition_y = cameraNode.position.y;
        // 只有发生位移时才刷新位置
        if (cameraPosition_x != position_x || cameraPosition_y != position_y) {
            cameraNode.position = v3(position_x, position_y);
        }

    }

    keyWalkBind() {
        let vertical = DisplacementInput.Instance.vertical;
        let horizontal = DisplacementInput.Instance.horizontal;

        // 更新动画状态
        if (horizontal == 1) {
            this.setState("hero_right");
        } else if (horizontal == -1) {
            this.setState("hero_left");
        } else if (vertical == 1) {
            this.setState("hero_up");
        } else if (vertical == -1) {
            this.setState("hero_down");
        }

        // 更新线速度(方向速度) 
        let linearVelocity = this.node.getComponent(RigidBody2D).linearVelocity;
        linearVelocity.x = this.speed * horizontal
        linearVelocity.y = this.speed * vertical
        this.node.getComponent(RigidBody2D).linearVelocity = linearVelocity;
    }


    update(deltaTime: number) {
        this.cameraFocusCat()
        this.keyWalkBind();
    }
}

