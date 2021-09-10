import { registerProto } from "../../../../script/Framework/Decorator/Decorator";
import { Message } from "../../../../script/Framework/Defineds/Interfaces/IMessage";
import { GameOneEvents } from "../../../gameOne/script/Events/GameOneEvents";

@registerProto(GameOneEvents.OPEN_GAMEONE_MODULE)
export class LoginMessage extends Message {
    encode(): boolean {
        throw new Error("Method not implemented.");
    }
    decode(data: any): boolean {
        throw new Error("Method not implemented.");
    }
    getData() {
        throw new Error("Method not implemented.");
    }
    getCmdID(): string {
        throw new Error("Method not implemented.");
    }

}