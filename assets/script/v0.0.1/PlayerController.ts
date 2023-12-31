import { _decorator, Animation, Component, find, Node, UIRenderer, v3 } from 'cc';
import { DisplacementInput } from './DisplacementInput';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {


    // 动画状态
    state: string;

    start() {
        
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
            cameraNode.position = v3(position_x + 240, position_y + 160);
        }

    }

    keyWalkBind(deltaTime: number) {
        let oldPosition_x = this.node.position.x;
        let oldPosition_y = this.node.position.y;
        let position_x =  oldPosition_x + 200 * deltaTime * DisplacementInput.Instance.horizontal;
        let position_y =  oldPosition_y + 200 * deltaTime * DisplacementInput.Instance.vertical;

        this.setState(DisplacementInput.Instance.state);
        this.node.position = v3(position_x, position_y);
    }


    update(deltaTime: number) {
        this.cameraFocusCat()
        this.keyWalkBind(deltaTime);
    }
}

