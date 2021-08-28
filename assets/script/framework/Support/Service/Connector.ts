import { Codec, Message } from "./Codec/Codec";
import { WebSocketClinet } from "./WebSocketClinet";

export default abstract class Connector {
    private _wsClient: WebSocketClinet = null
    constructor() {
        this._wsClient = new WebSocketClinet();
        this._wsClient.onClose = this.onClose.bind(this);
        this._wsClient.onError = this.onError.bind(this);
        this._wsClient.onMessage = this.onMessage.bind(this);
        this._wsClient.onOpen = this.onOpen.bind(this);
    }

    /**
     * @description 发送心跳
     * 请重写sendHeartbeat
     */
    protected abstract sendHeartbeat()

    /**
     * @description 获取最大心跳超时的次数
     */
    protected get MaxHeartbeatTimeOut(): number { return 5 }

    /**@description 心跳发送间隔，默认为5秒 */
    protected get HeartbeatInterval(): number { return 5000 }

    /**
     * @description 心跳超时
     */
    protected onHeartbeatTimeOut() { }

    /**
     * @description 是否为心跳消息
     */
    protected isHeartBeat(data: Socket.IMessage): boolean { return false }

    private _curRecvHartTimeOutCount: number = 0;//当前接收心跳超时的次数
    private _sendHartId: number = -1; //发送心跳包的间隔id

    protected onOpen() {
        this._curRecvHartTimeOutCount = 0
        this.stopSendHartSchedule();
        this.sendHeartbeat();
        this.startSendHartSchedule();
    }

    /**
     * @description 网络关闭
     */
    protected onClose(ev: Event) {
        //停止心跳发送，已经没有意义
        this.stopSendHartSchedule();
    }

    /**
     * @description 网络错误
     */
    protected onError(ev: Event) {
        //网络连接出错误，停止心跳发送
        this.stopSendHartSchedule();
    }

    /**
     * @description 收到网络消息
     */
    protected onMessage(data: Uint8Array) {
        this.recvHeartbeat();
    }
    /**
        * @description 收到心跳
        */
    protected recvHeartbeat() {
        this._curRecvHartTimeOutCount = 0;
    }

    private _enabled = true;
    /**@description 是否启用 */
    public get enabled() { return this._enabled; }
    public set enabled(value: boolean) {
        this._enabled = value
        if (value == false) { this.close() }
    }
    /**
         * @description 连接网络
         * @param ip 
         * @param port 
         * @param protocol 协议类型 ws / wss 
         */
    public connect_server(ip: string, port: number | string = null, protocol: Socket.WebSocketType = "wss") {
        if (!this.enabled) {
            if (CC_DEBUG) cc.warn(`请求先启用`)
            return;
        }
        if (port) {
            if (typeof port == "string" && port.length > 0) {
                this._wsClient && this._wsClient.initWebSocket(ip, port, protocol);
            } else if (typeof port == "number" && port > 0) {
                this._wsClient && this._wsClient.initWebSocket(ip, port.toString(), protocol);
            } else {
                this._wsClient && this._wsClient.initWebSocket(ip, null, protocol);
            }
        } else {
            this._wsClient && this._wsClient.initWebSocket(ip, null, protocol);
        }
    }


    /**
     * @description 发送请求
     * @param msg 消息
     */
    protected sendBuffer(buffer: Uint8Array | string): void {
        this._wsClient && this._wsClient.send(buffer);
    }

    public close(isEnd: boolean = false): void {
        this.stopSendHartSchedule();
        this._wsClient && this._wsClient.close(isEnd);
    }

    /**@description 网络是否连接成功 */
    public get isConnected(): boolean {
        if (this._wsClient) { return this._wsClient.isConnected }
        return false
    }


    /**
     * @description 清除定时发送心跳的定时器id
     */
    protected stopSendHartSchedule() {
        if (this._sendHartId != -1) {
            clearInterval(this._sendHartId);
            this._sendHartId = -1;
        }
    }

    /**
     * @description 启动心跳发送
     */
    protected startSendHartSchedule() {
        this._sendHartId = setInterval(() => {
            this._curRecvHartTimeOutCount = this._curRecvHartTimeOutCount + 1;
            if (this._curRecvHartTimeOutCount > this.MaxHeartbeatTimeOut) {
                this.stopSendHartSchedule();
                this.onHeartbeatTimeOut();
                return;
            }
            this.sendHeartbeat();
        }, this.HeartbeatInterval);

    }
}