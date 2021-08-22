import { PomeloRequestMessage, serialize } from "../../framework/Support/Service/Message/JsonMessage";
import { MessageHeader } from "../../framework/Support/Service/Message/BaseMessage/MessageHeader";
import { PomeloMessageHeader } from "../../Common/Net/Pomelo/PomeloMessage";


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
    get getExcutName() { return this.route }

}

export class PinusTestMessageHeader extends PomeloMessageHeader {
}

