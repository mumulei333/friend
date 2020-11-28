import Controller from "../../framework/controller/Controller";
import { CustomNetEventType } from "../../framework/event/EventApi";
import { Config } from "../config/Config";
import { LogicEvent, LogicEventData, LogicType } from "../event/LogicEvent";
import { Manager } from "../manager/Manager";
import { CommonService } from "./CommonService";

/**
 * @description 断线重连模态框 
 * 当断线重连回来时，由Reconnet挂载重连网络组件
 * 显示到当前场景的最高层
 * */
const { ccclass, property } = cc._decorator;

@ccclass
export default class ReconnectComponent extends Controller<CommonService> {

    /**@description 当前连接次数 */
    private _connectCount = 0;
    /**@description 最大重连次数 */
    private _maxConnectCount = 3;
    /**@description 是否已经调用了connect */
    private _isDoConnect = false;

    private get logName() {
        return `[${cc.js.getClassName(this.service)}].${this.logTag}`
    }

    protected bindingEvents() {
        super.bindingEvents();
        this.registerEvent(LogicEvent.ENTER_COMPLETE, this.enterComplete);
    }

    private enterComplete(data: LogicEventData) {
        if (data.type == LogicType.LOGIN) {
            this.service && this.service.reconnect.hide();
        }
    }

    start() {
        cc.log(`${this.logName} start`);
        this.tryReconnect();
    }

    public tryReconnect() {
        this.service && this.service.close();
        this._isDoConnect = true;
        this.delayConnect();
    }

    private delayConnect() {
        if (this._isDoConnect) {
            let time = 0.3;
            if (this._connectCount > 0) {
                time = (this._connectCount + 1) * time;
                if (time > 3) { time = 3; }//最多推后3秒进行重连
                cc.log(`${this.logName}${time}秒后尝试重新连接`);
            }
            this.scheduleOnce(this.connect, time);
            this._isDoConnect = false;
            //启用连接超时处理
            this.unschedule(this.connectTimeOut);
            this.scheduleOnce(this.connectTimeOut, Config.RECONNECT_TIME_OUT);
        }
    }

    private async connect() {
        let loginView = await Manager.uiManager.getView("LoginView");
        if (loginView) {
            //现在已经在登录界面，不再尝试重新连接
            this.service.reconnect.hide();
            cc.warn(`${this.logName} 重连处于登录界面，停止重连`);
            return;
        }
        this._isDoConnect = true;
        this._connectCount++;
        if (this._connectCount > this._maxConnectCount) {
            this.showReconnectDialog();
            return;
        }
        this.service.reconnect.showNode(Manager.getLanguage(["tryReconnect", this.service.serviceName, this._connectCount]));
        this.service.connect();
    }

    private connectTimeOut() {
        //连接超时了30s，都没有得到服务器的返回，直接提示让玩家确定是否重连连接网络
        this._isDoConnect = false;
        //停止掉连接定时器
        this.unschedule(this.connect);
        //关闭网络
        this.service && this.service.close();
        //弹出重连提示框
        this.showReconnectDialog();
    }

    private showReconnectDialog() {
        this.service && this.service.reconnect.hideNode();
        cc.log(`${this.logName} ${this.service.serviceName} 断开`)
        Manager.alert.show({
            tag: this.logName,
            text: Manager.getLanguage(["warningReconnect", this.service.serviceName]),
            confirmCb: (isOK) => {
                if (isOK) {
                    cc.log(`${this.logName} 重连连接网络`);
                    this._connectCount = 0;
                    this.connect();
                } else {
                    cc.log(`${this.logName} 玩家网络不好，不重连，退回到登录界面`);
                    dispatch(LogicEvent.ENTER_LOGIN, true);
                }
            },
            cancelCb: () => {
                cc.log(`${this.logName} 玩家网络不好，不重连，退回到登录界面`);
                dispatch(LogicEvent.ENTER_LOGIN, true);
            }
        });
    }

    protected onNetOpen() {
        super.onNetOpen();
        //根据自己的业务，请示登录，拉游戏数据等操作
        this.service.reconnect.hide();
        this._connectCount = 0;
        Manager.alert.close(this.logName);
        Manager.serviceManager.onReconnectSuccess(this.service);
        cc.log(`${this.logName} ${this.service.serviceName}服务器重连成功`);
    }

    protected onNetError(ev: Event) {
        super.onNetError(ev);
        Manager.loading.hide();
        //先断开旧的socket连接
        this.service.close();
        this.delayConnect();
    }

    protected onNetClose(ev: Event) {
        super.onNetClose(ev);
        if (ev.type == CustomNetEventType.CLOSE) {
            cc.log(`${this.logName} 应用层主动关闭socket`);
            return;
        }
        Manager.loading.hide();
        this.delayConnect();
    }

}