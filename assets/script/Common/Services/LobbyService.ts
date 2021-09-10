import { decorator } from "../../Framework/Decorator/Decorator";
import { AbstractSerialize } from "../../Framework/Defineds/Interfaces/IMessage";
import { ICommonService } from "../../Framework/Support/NetWork/Socket/ICommonService";
import { Codec } from "./Codec/Codec";

@decorator.className()
@decorator.registerService(Codec)
export class LobbyService extends ICommonService {
    protected isHeartBeat(data: AbstractSerialize): boolean {
        throw new Error("Method not implemented.");
    }
}