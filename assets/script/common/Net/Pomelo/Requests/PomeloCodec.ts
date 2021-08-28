import { Codec } from "../../../../framework/Support/Service/Codec/Codec"
import { pomelo_message } from "../MessagePackage/message"
import { pomelo_protobuf } from "../MessagePackage/protobuf"
import { pomelo_Protocol } from "../MessagePackage/protocol"
import { PomeloData } from "../PomeloData"
import { PomeloRequestMessage } from "./PomeloMessage"

export class PomeloCodec extends Codec {
    private msg: any = null
    private routeCmd: string = ""
    private _data: any = null

    Pack(dat: PomeloRequestMessage): boolean {
        let type = dat.isRequest ? pomelo_message.TYPE_REQUEST : pomelo_message.TYPE_NOTIFY
        if (type == pomelo_message.TYPE_REQUEST) {
            PomeloData.reqId++
            PomeloData.routeMap[PomeloData.reqId] = dat.Data.route
        }
        if (PomeloData.clientProtos[dat.Data.route]) {
            this.msg = pomelo_protobuf.encode(dat.Data.route, dat.Data.msg)
        } else {
            this.msg = pomelo_Protocol.strencode(JSON.stringify(dat.Data.msg))
        }
        let compressRoute = 0
        if (PomeloData.dict && PomeloData.dict[dat.Data.route]) {
            dat.Data.route = PomeloData.dict[dat.Data.route]
            compressRoute = 1
        }

        this._data = pomelo_message.encode(PomeloData.reqId, type, compressRoute, dat.Data.route, this.msg)
        this._data = PomeloData.package.encode(PomeloData.package.TYPE_DATA, this._data)
        return true
    }

    UnPack(data: Uint8Array): boolean {
        let msg = pomelo_Protocol.Package.decode(data)
        this.routeCmd = String(msg.type)
        this._data = msg
        return true
    }

    get Data() { return this._data }

    get MsgID(): string { return this.routeCmd }
}
