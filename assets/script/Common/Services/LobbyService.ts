import { ClassName, registerService } from "../../Framework/Decorator/Decorator";
import { Message } from "../../Framework/Defineds/Interfaces/IMessage";
import { ICommonService } from "../../Framework/Support/NetWork/Socket/ICommonService";

@ClassName()
@registerService()
export class LobbyService extends ICommonService {
    protected isHeartBeat(data: Message): boolean {
        throw new Error("Method not implemented.");
    }
}