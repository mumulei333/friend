import { Reconnect } from "./Reconnect";
import { EventApi } from "../../framework/event/EventApi";
import { IMessage } from "../../framework/net/Message";
import { pomelo_message } from "../../framework/net/Pomelo/message";
import { pomelo_protobuf } from "../../framework/net/Pomelo/protobuf";
import { pomelo_Protocol } from "../../framework/net/Pomelo/protocol";
import { ICommonService } from "./ICommonService";

export class PomeloSocket extends ICommonService {
    protected isHeartBeat(data: IMessage): boolean {
        return false
    }

    protected static _instance: PomeloSocket = null!;
    public static get instance() { return this._instance || (this._instance = new PomeloSocket()); }




    private callbacks: { [key: number]: Function } = {}
    private routeMap: { [key: number]: string } = {}
    protected ip = ""
    protected port: number = null!;
    protected protocol: WebSocketType = "ws"

    private handlers: Map<number, Function> = new Map()
    private package: typeof pomelo_Protocol.Package = pomelo_Protocol.Package

    private dict: { [keyof: string]: string } | null = {}
    private abbrs: { [keyof: string]: string } = {}
    private protoVersion: number = 0
    private serverProtos: any = {}
    private clientProtos: any = {}
    private _callbacks: any = {}

    /**@description 网络重连 */
    public reconnect: Reconnect = null!;
    constructor() {
        super();
        this.reconnect = new Reconnect(this);
        this.startListener()
        window["pomelo"] = { request: this.request.bind(this), notify: this.notify.bind(this) }
    }

    /** 一些全局的监听 就放这里比较好 */
    protected startListener() { }

    connect() {
        this.handlers.set(this.package.TYPE_HANDSHAKE, this.handshake.bind(this))
        this.handlers.set(this.package.TYPE_DATA, this.onData.bind(this))
        // this.handlers.set(this.package.TYPE_HEARTBEAT, this.onHeartbeat.bind(this))
        this.handlers.set(this.package.TYPE_KICK, this.onKick.bind(this))
        this.startConnect()
    }

    private startConnect() {
        this.readLocalProtos()
        super.connect_server(this.ip, this.port, this.protocol);
    }

    protected onOpen() {
        /**
         * @description 网络连接成功发送握手协议
         */
        let obj = this.package.encode(this.package.TYPE_HANDSHAKE, pomelo_Protocol.strencode(JSON.stringify(HANDSHAKEBUFFER)))
        this.sendBuffer(obj)
    }

    /**@description 发送心跳包 */
    protected sendHeartbeat() {
        var obj = this.package.encode(this.package.TYPE_HEARTBEAT)
        this.sendBuffer(obj)
    }

    protected onMessage(data: Uint8Array) {
        let decode = this.package.decode(data)
        this.handlers.get(decode.type)?.apply(this, [decode.body])
    }


    private readLocalProtos() {
        if (window.localStorage.getItem("protos") && this.protoVersion == 0) {
            var protos = JSON.parse(window.localStorage.getItem("protos")!)
            this.protoVersion = protos.version || 0
            this.serverProtos = protos.server || {}
            this.clientProtos = protos.client || {}

            pomelo_protobuf.init({ encoderProtos: this.clientProtos, decoderProtos: this.serverProtos })
        }
        HANDSHAKEBUFFER.sys.protoVersion = this.protoVersion
    }


    /** @description 握手成功回调 */
    private handshake(data: Uint8Array) {
        let dat: { code: number, sys: any } = JSON.parse(pomelo_Protocol.strdecode(data))
        if (dat.code == RES_OLD_CLIENT) {
            return this.excut("error", "client version not fullfill")
        }
        if (dat.code !== RES_OK) {
            return this.excut("error", "handshake fail")
        }

        this.initHandshakeData(dat)
        let obj = this.package.encode(this.package.TYPE_HANDSHAKE_ACK)
        this.sendBuffer(obj)
        super.stopSendHartSchedule()
        super.startSendHartSchedule()
        //发送第一次心跳
        // this.sendHeartbeat()
        //Pinus或者Pomelo 链接通知应用层链接打开了
        dispatch(EventApi.NetEvent.ON_OPEN, { service: this, event: null });
    }

    private _heartbeatInterval: number = 0

    protected getHeartbeatInterval() {
        return this._heartbeatInterval
    }

    private initHandshakeData(data: any) {
        if (data.sys && data.sys.heartbeat) { this._heartbeatInterval = data.sys.heartbeat * 1000 }
        else { this._heartbeatInterval = 0 }


        if (!data || !data.sys) { return }
        this.dict = data.sys.dict
        let protos = data.sys.protos

        if (this.dict) {
            this.abbrs = {}
            for (let route in this.dict) {
                this.abbrs[this.dict[route]] = route
            }
        }

        if (protos) {
            this.protoVersion = protos.version || 0
            this.serverProtos = protos.server || {}
            this.clientProtos = protos.client || {}

            //存入本地
            window.localStorage.setItem("protos", JSON.stringify(protos))

            if (!!pomelo_protobuf) {
                pomelo_protobuf.init({ encoderProtos: protos.client, decoderProtos: protos.server })
            }
        }
    }

    /** @description Pomelo 服务端有数据到达 */
    private onData(data: any) {
        let msg = this.defaultDecode(data)
        if (!msg?.id) {
            return this.excut(msg?.route, msg?.body)
        }

        let cb = this.callbacks[msg.id]
        if (typeof cb !== "function") { return }
        cb(msg.body)
    }

    public listenet(event: string, fn: Function) {
        this._callbacks[event] = this._callbacks[event] || []
        this._callbacks[event].push(fn)
    }

    private excut(event: any, ...args: any[]) {
        var params = [].slice.call(arguments, 1)
        var callbacks = this._callbacks[event!]

        if (callbacks) {
            callbacks = callbacks.slice(0)
            for (var i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, params)
            }
        }

        return this
    }

    private onHeartbeat() { }

    /**@description Pomelo 服务器踢出客户端 */
    private onKick(data: any) {
        data = JSON.parse(pomelo_Protocol.strdecode(data))
        this.excut("onKick", data)
    }


    private defaultDecode(data: any) {
        let msg = pomelo_message.decode(data)
        if (msg.id > 0) {
            msg.route = this.routeMap[msg.id]
            delete this.routeMap[msg.id]
            if (!msg.route) { return }
        }
        msg.body = this.deCompose(msg)
        return msg
    }

    private deCompose(msg: {
        id: number;
        type: number;
        compressRoute: number;
        route: any;
        body: Uint8Array;
    }) {
        let route = msg.route
        if (msg.compressRoute) {
            if (!this.abbrs![route]) {
                return {}
            }
            route = msg.route = this.abbrs[route]
        }

        if (this.serverProtos[route]) {
            return pomelo_protobuf.decode(route, msg.body)
        } else {
            return JSON.parse(pomelo_Protocol.strdecode(msg.body))
        }
    }

    private defaultEncode(reqId: number, route: string, msg: any): Uint8Array {
        let type = reqId ? pomelo_message.TYPE_REQUEST : pomelo_message.TYPE_NOTIFY
        if (this.clientProtos[route]) {
            msg = pomelo_protobuf.encode(route, msg)
        } else {
            msg = pomelo_Protocol.strencode(JSON.stringify(msg))
        }
        let compressRoute = 0
        if (this.dict && this.dict[route]) {
            route = this.dict[route]
            compressRoute = 1
        }
        return pomelo_message.encode(reqId, type, compressRoute, route, msg)
    }

    public request(route: string, msg: any) {
        if (!this.isConnected) { return }
        let callback = (retData: any) => {
            this.addMessageQueue(route, retData, false)
            // dispatch(route, data)
        }
        this._request(route, msg, callback)
    }

    private reqId: number = 0
    private _request(route: string, msg: any, fn: Function) {
        if (arguments.length === 2 && typeof msg === "function") {
            fn = msg
            msg = {}
        } else {
            msg = msg || {}
        }
        route = route || msg.route
        if (!route) {
            return
        }

        this.reqId++
        this.sendMessage(this.reqId, route, msg)

        this.callbacks[this.reqId] = fn
        this.routeMap[this.reqId] = route
    }

    public notify(route: string, msg: any) {
        msg = msg || {}
        this.sendMessage(0, route, msg)
    }

    private sendMessage(reqId: number, route: string, msg: any): void {
        if (!this.isConnected) { return }
        let encode = this.defaultEncode(reqId, route, msg)
        let pkg = this.package.encode(this.package.TYPE_DATA, encode)
        this.sendBuffer(pkg)
    }

    /**
     * @description 心跳超时
     */
    protected onHeartbeatTimeOut() {
        this.excut("heartbeatTimeout")
        this.close()
    }
}



const RES_OK = 200
const RES_FAIL = 500
const RES_OLD_CLIENT = 501

const JS_WS_CLIENT_TYPE = "js-websocket"
const JS_WS_CLIENT_VERSION = "0.0.1"
const HANDSHAKEBUFFER: any = {
    sys: {
        type: JS_WS_CLIENT_TYPE,
        version: JS_WS_CLIENT_VERSION,
        rsa: {},
    },
    user: {},
}