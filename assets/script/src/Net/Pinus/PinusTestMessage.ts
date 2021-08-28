import { JsonMessage, serialize } from "../../../Common/Net/Message/Json/JsonMessage"
import { PomeloRequestMessage } from "../../../Common/Net/Pomelo/Requests/PomeloMessage"

export interface PinusResponse<T> {
    code: number
    data: T
}

export interface EntryResponse {
    chairID: number
    diamond: number
    faceID: number
    gameID: number
    head: string
    isAndroid: false
    isWather: boolean
    moduleEnName: string
    moduleID: number
    nickname: string
    online: number
    roomCode: number
    roomID: number
    score: number
    serverID: string
    sex: number
    tableID: number
    userID: number
    wxUnionID: string
}

export class entryRespData extends JsonMessage {
    @serialize("diamond", Number)
    diamond: Number = null
    @serialize("nickname", String)
    nickname: string = null
}

export class entryResp extends JsonMessage {
    @serialize("code", Number)
    code: number = null
    @serialize("data", entryRespData)
    data: entryRespData = null
}



export class entryHandler extends PomeloRequestMessage {
    @serialize("type", Number)
    type: number = 3

    // @serialize("extendField", Map, String, Number)
    // extendField: Map<String, any> = new Map()

    @serialize("extendField", Object)
    extendFiled: Object = {}
}




export class PinusTestMessage extends PomeloRequestMessage {
    get isRequest(): boolean { return true }
    @serialize("route", String)
    route: string = "connector.entryHandler.enter"

    @serialize("msg", entryHandler)
    msg: entryHandler = null
    get MsgID() { return "connector.entryHandler.enter" }

}