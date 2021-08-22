import { Message } from "../../../framework/Support/Service/Message/BaseMessage/Message";
import { MessageHeader } from "../../../framework/Support/Service/Message/BaseMessage/MessageHeader";
import { PomeloRequestMessage } from "../../../framework/Support/Service/Message/JsonMessage";
import { pomelo_message } from "./MessagePackage/message";
import { pomelo_protobuf } from "./MessagePackage/protobuf";
import { pomelo_Protocol } from "./MessagePackage/protocol";
import { PomeloData } from "./PomeloData";


export class PomeloMessageHeader extends MessageHeader {
    private msg: any = null
    private routeCmd: string = ""

    encode(dat: PomeloRequestMessage): boolean {
        let type = dat.isRequest ? pomelo_message.TYPE_REQUEST : pomelo_message.TYPE_NOTIFY
        if (type == pomelo_message.TYPE_REQUEST) {
            PomeloData.reqId++
            PomeloData.routeMap[PomeloData.reqId] = dat.data.route
        }
        if (PomeloData.clientProtos[dat.data.route]) {
            this.msg = pomelo_protobuf.encode(dat.data.route, dat.data.msg)
        } else {
            this.msg = pomelo_Protocol.strencode(JSON.stringify(dat.data.msg))
        }
        let compressRoute = 0
        if (PomeloData.dict && PomeloData.dict[dat.data.route]) {
            dat.data.route = PomeloData.dict[dat.data.route]
            compressRoute = 1
        }

        this.buffer = pomelo_message.encode(PomeloData.reqId, type, compressRoute, dat.data.route, this.msg)
        this.buffer = PomeloData.package.encode(PomeloData.package.TYPE_DATA, this.buffer)
        return true
    }

    decode(data: Uint8Array): boolean {
        let msg = pomelo_Protocol.Package.decode(data)
        this.routeCmd = String(msg.type)
        this.buffer = msg as any
        return true
    }

    get data() { return this.buffer }

    get CmdName(): string { return this.routeCmd }
}


export interface PomeloMessageHeaderStruct {
    readonly isRequest: boolean
    route: string
    msg: any
    data: Uint8Array
}