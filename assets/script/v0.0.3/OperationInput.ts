import { _decorator, Input, input, KeyCode, macro, Node, systemEvent, SystemEvent, SystemEventType } from 'cc';


export class OperationInput {

    private static instance: OperationInput = null;

    // callbackWalkFun: Function;
    // callbackCryFun: Function;

    // callbackHeadsAnimationFun: Function;
    // callbackTailsAnimationFun: Function;


    callbackFunByKey_O: Function;
    callbackFunByKey_K: Function;
    callbackFunByKey_L: Function;
    callbackFunByKey_P: Function;


    static get Instance() {
        if (this.instance == null) { 
            this.instance = new OperationInput(); 
        }
        return this.instance; 
    }

    constructor() {
        // 键盘按下Up, down, left and right
        input.on(Input.EventType.KEY_DOWN, (event) => {
            // O:面板, K:调查, L:确认, P:返回
            if (event.keyCode == KeyCode.KEY_O) {
                this.callbackFunByKey_O();
            } else if (event.keyCode == KeyCode.KEY_K) {
                this.callbackFunByKey_O();
            } else if (event.keyCode == KeyCode.KEY_L) {
                this.callbackFunByKey_O();
            } else if (event.keyCode == KeyCode.KEY_P) {
                this.callbackFunByKey_O();
            }

        })

        // 键盘抬起
        input.on(Input.EventType.KEY_UP, (event) => {
            // if (event.keyCode == KeyCode.KEY_W && this.vertical == 1) {
            //     this.vertical = 0;
            // } else if (event.keyCode == KeyCode.KEY_S && this.vertical == -1) {
            //     this.vertical = 0;
            // }

            // if (event.keyCode == KeyCode.KEY_A && this.horizontal == -1) {
            //     this.horizontal = 0;
            // } else if (event.keyCode == KeyCode.KEY_D && this.horizontal == 1) {
            //     this.horizontal = 0;
            // }

            // if (this.vertical == 0 && this.horizontal == 0) {
            //     // this.callbackCryFun()
            // }
        })
    }







}

