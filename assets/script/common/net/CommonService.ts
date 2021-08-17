
import { IMessage } from "../../framework/net/Message";
import { MainCmd, SUB_CMD_SYS } from "../protocol/CmdDefines";
import { Reconnect } from "./Reconnect";
import { Config } from "../config/Config";
import { CustomNetEventType } from "../../framework/event/EventApi";
import { ICommonService } from "./ICommonService";

/**
 * @description service公共基类
 */

export class CommonService extends ICommonService {

    protected static _instance: CommonService = null;
    public static get instance() { return this._instance || (this._instance = new CommonService()); }
    protected ip = ""
    protected port: number = null;
    protected protocol: WebSocketType = "wss"

    /**
    * @description 连接网络
    */
    public connect() {
        super.connect_server(this.ip, this.port, this.protocol);
    }

    /**@description 网络重连 */
    public reconnect: Reconnect = null;
    constructor() {
        super();
        this.reconnect = new Reconnect(this);
    }
    /**
     * @description 获取最大心跳超时的次数
     */
    protected getMaxHeartbeatTimeOut(): number {
        return super.getMaxHeartbeatTimeOut();
    }

    protected getHeartbeatInterval() {
        return super.getHeartbeatInterval();
    }

    /**
     * @description 心跳超时
     */
    protected onHeartbeatTimeOut() {
        super.onHeartbeatTimeOut();
        cc.warn(`${this.serviceName} 心跳超时，您已经断开网络`);
        this.close();
        Manager.serviceManager.tryReconnect(this, true);
    }
    /**
     * @description 是否为心跳消息
     */
    protected isHeartBeat(data: IMessage): boolean {
        //示例
        return data.mainCmd == MainCmd.CMD_SYS && data.subCmd == SUB_CMD_SYS.CMD_SYS_HEART;
    }

    protected onError(ev: Event) {
        super.onError(ev)
        Manager.uiManager.getView("LoginView").then(view => {
            if (view) return;
            Manager.serviceManager.tryReconnect(this);
        });
    }

    protected onClose(ev: Event) {
        super.onClose(ev)
        if (ev.type == CustomNetEventType.CLOSE) {
            cc.log(`${this.serviceName} 应用层主动关闭Socket`);
            return;
        }
        Manager.uiManager.getView("LoginView").then(view => {
            if (view) return;
            Manager.serviceManager.tryReconnect(this);
        });
    }
}