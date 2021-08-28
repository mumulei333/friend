import { EventApi } from "../../../framework/Support/Event/EventApi";
import { ICommonService } from "../../../framework/Support/Service/ICommonService";
import { Reconnect } from "../../../framework/Support/Service/Reconnect";
import { pomelo_protobuf } from "./MessagePackage/protobuf";
import { pomelo_Protocol } from "./MessagePackage/protocol";
import { PomeloData } from "./PomeloData";
import { pomelo_message } from './MessagePackage/message';
import { Codec, Message } from '../../../framework/Support/Service/Codec/Codec';
export class PomeloService extends ICommonService {
    protected isHeartBeat(data: Codec): boolean {
        if (data.MsgID == String(pomelo_Protocol.Package.TYPE_HEARTBEAT)) {
            return true
        }
        else { return false }
    }
    protected static _instance: PomeloService = null!;
    public static get instance() { return this._instance || (this._instance = new PomeloService()) }

    // private callbacks: { [key: number]: Function } = {}
    protected ip = ""
    protected port: number = null!;
    protected protocol: Socket.WebSocketType = "ws"

    // private handlers: Map<number, Function> = new Map()
    private protoVersion: number = 0
    private '/': any = {}
    private _callbacks: any = {}

    /**@description 网络重连 */
    public reconnect: Reconnect = null!;
    constructor() {
        super();
        this.reconnect = new Reconnect(this);
        this.startListener()
    }

    /** 一些全局的监听 就放这里比较好 */
    protected startListener() { }

    connect() {
        //
        this.addListener(String(PomeloData.package.TYPE_HANDSHAKE), PomeloMessage, this.handshake as any, false, this)
        this.addListener(String(PomeloData.package.TYPE_DATA), PomeloMessage, this.onData as any, false, this)
        this.addListener(String(PomeloData.package.TYPE_KICK), this.handshake, null, false, this)
        // this.handlers.set(PomeloData.package.TYPE_HANDSHAKE, this.handshake.bind(this))
        // this.handlers.set(PomeloData.package.TYPE_DATA, this.onData.bind(this))
        // // this.handlers.set(this.package.TYPE_HEARTBEAT, this.onHeartbeat.bind(this))
        // this.handlers.set(PomeloData.package.TYPE_KICK, this.onKick.bind(this))
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
        let obj = PomeloData.package.encode(PomeloData.package.TYPE_HANDSHAKE, pomelo_Protocol.strencode(JSON.stringify(HANDSHAKEBUFFER)))
        this.sendBuffer(obj)
    }

    /**@description 发送心跳包 */
    protected sendHeartbeat() {
        var obj = PomeloData.package.encode(PomeloData.package.TYPE_HEARTBEAT)
        this.sendBuffer(obj)
    }

    // protected onMessage(data: Uint8Array) {
    //     // let decode = PomeloData.package.decode(data)
    //     // this.handlers.get(decode.type)?.apply(this, [decode.body])
    // }


    private readLocalProtos() {
        if (window.localStorage.getItem("protos") && this.protoVersion == 0) {
            var protos = JSON.parse(window.localStorage.getItem("protos")!)
            this.protoVersion = protos.version || 0
            PomeloData.serverProtos = protos.server || {}
            PomeloData.clientProtos = protos.client || {}

            pomelo_protobuf.init({ encoderProtos: PomeloData.clientProtos, decoderProtos: PomeloData.serverProtos })
        }
        HANDSHAKEBUFFER.sys.protoVersion = this.protoVersion
    }


    /** @description 握手成功回调 */
    private handshake(data: Message) {
        let dat: { code: number, sys: { dict: { [key: string]: number }, dictVersion: string, heartbeat: number } } = data.Data
        if (dat.code == RES_OLD_CLIENT) {
            // return this.excut("error", "client version not fullfill")
        }
        if (dat.code !== RES_OK) {
            // return this.excut("error", "handshake fail")
        }

        this.initHandshakeData(dat)
        let obj = PomeloData.package.encode(PomeloData.package.TYPE_HANDSHAKE_ACK)
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
        PomeloData.dict = data.sys.dict
        let protos = data.sys.protos

        if (PomeloData.dict) {
            PomeloData.abbrs = {}
            for (let route in PomeloData.dict) {
                PomeloData.abbrs[PomeloData.dict[route]] = route
            }
        }

        if (protos) {
            this.protoVersion = protos.version || 0
            PomeloData.serverProtos = protos.server || {}
            PomeloData.clientProtos = protos.client || {}

            //存入本地
            window.localStorage.setItem("protos", JSON.stringify(protos))

            if (!!pomelo_protobuf) {
                pomelo_protobuf.init({ encoderProtos: protos.client, decoderProtos: protos.server })
            }
        }
    }

    /** @description Pomelo 服务端有数据到达 */
    private onData(data: Message) {
        this.addMessageQueue(data.MsgID, data.Data.body, true)
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



    public send(msg: Message) {
        super.send(msg)
    }

    // public notify(route: string, msg: any) {
    //     msg = msg || {}
    //     this.sendMessage(0, route, msg)
    // }
    /**
     * @description 心跳超时
     */
    protected onHeartbeatTimeOut() {
        this.excut("heartbeatTimeout")
        this.close()
    }
}

class PomeloMessage extends Message {
    private _routeName: string = ""
    private content: any = null
    Encode(): boolean { return false }

    Decode(data: { body: Uint8Array, type: number }): boolean {
        if (data.type == PomeloData.package.TYPE_HANDSHAKE) {
            return this.decodeHandshake(data.body)
        } else if (data.type = PomeloData.package.TYPE_DATA) {
            return this.decodeOnData(data.body)
        }
        return true
    }

    private decodeOnData(data: Uint8Array) {
        let msg = pomelo_message.decode(data)
        if (msg.id > 0) {
            msg.route = PomeloData.routeMap[msg.id]
            delete PomeloData.routeMap[msg.id]
            if (!msg.route) { return false }
        }
        msg.body = this.deCompose(msg)
        this.content = msg as any
        this._routeName = msg.route
        return true
    }

    private decodeHandshake(data: Uint8Array): boolean {
        let dat: { code: number, sys: any } = JSON.parse(pomelo_Protocol.strdecode(data))
        let success: boolean = true
        if (dat.code == RES_OLD_CLIENT) { success = false }
        if (dat.code !== RES_OK) { success = false }
        this.content = dat as any
        return success
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
            if (!PomeloData.abbrs![route]) {
                return {}
            }
            route = msg.route = PomeloData.abbrs[route]
        }

        if (PomeloData.serverProtos[route]) {
            return pomelo_protobuf.decode(route, msg.body)
        } else {
            return JSON.parse(pomelo_Protocol.strdecode(msg.body))
        }
    }
    get Data() { return this.content }
    get MsgID() { return this._routeName }
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
    // user: {},
}