import { _decorator, Animation, BoxCollider2D, Collider2D, Component, Contact2DType, find, IPhysics2DContact, Node, RigidBody2D, UIRenderer, v3 } from 'cc';
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
        let collider = this.node.getComponent(BoxCollider2D)
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact:只在两个碰撞体开始接触时被调用一次');
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

