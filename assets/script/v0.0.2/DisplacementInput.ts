import { _decorator, Input, input, KeyCode, macro, Node, systemEvent, SystemEvent, SystemEventType } from 'cc';


export class DisplacementInput {

    private static instance: DisplacementInput = null;

    // callbackWalkFun: Function;
    // callbackCryFun: Function;

    // callbackHeadsAnimationFun: Function;
    // callbackTailsAnimationFun: Function;

    // 水平轴
    horizontal: number = 0;
    // 垂直轴
    vertical: number = 0;

    // 行走动画状态
    state: string;

    static get Instance() {
        if (this.instance == null) { 
            this.instance = new DisplacementInput(); 
        }
        return this.instance; 
    }

    setState(state: string) {
        if (this.state == state) return;
        this.state = state;
    }

    constructor() {
        // 键盘按下Up, down, left and right
        input.on(Input.EventType.KEY_DOWN, (event) => {
            if (event.keyCode == KeyCode.KEY_W) {
                this.vertical = 1;
                this.setState("hero_up");
            } else if (event.keyCode == KeyCode.KEY_S) {
                this.vertical = -1;
                this.setState("hero_down");
            }

            if (event.keyCode == KeyCode.KEY_A) {
                this.horizontal = -1;
                this.setState("hero_left");
                // this.callbackTailsAnimationFun();
            } else if (event.keyCode == KeyCode.KEY_D) {
                this.horizontal = 1;
                this.setState("hero_right");
                // this.callbackHeadsAnimationFun();
            }

            if (this.vertical != 0 || this.horizontal != 0) {
                // this.callbackWalkFun()
            }

        })

        // 键盘抬起
        input.on(Input.EventType.KEY_UP, (event) => {
            if (event.keyCode == KeyCode.KEY_W && this.vertical == 1) {
                this.vertical = 0;
            } else if (event.keyCode == KeyCode.KEY_S && this.vertical == -1) {
                this.vertical = 0;
            }

            if (event.keyCode == KeyCode.KEY_A && this.horizontal == -1) {
                this.horizontal = 0;
            } else if (event.keyCode == KeyCode.KEY_D && this.horizontal == 1) {
                this.horizontal = 0;
            }

            if (this.vertical == 0 && this.horizontal == 0) {
                // this.callbackCryFun()
            }
        })
    }







}

