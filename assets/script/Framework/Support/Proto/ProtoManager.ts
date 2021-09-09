import { Message } from "../../Defineds/Interfaces/IMessage";
import { getClassName } from "../../Extentions/getClassName";


export class ProtoManager {
    private static _instance: ProtoManager = null!;
    public static get Instance() { return this._instance || (this._instance = new ProtoManager()); }


    private _protos: Map<string, new () => Message> = new Map()

    public register(proto: new () => Message, cmd: string = "") {
        if (cmd == "" || cmd == null) { cmd = getClassName(proto) }
        if (!this._protos.has(cmd)) {
            this._protos.set(cmd, proto)
        }
    }

    public getProto(cmd: string) {
        if (this._protos.has(cmd)) {
            return this._protos.get(cmd)
        }
    }

    public removeProtos(cmds: string | Array<string>) {
        if (typeof cmds == "string") {
            if (this._protos.has(cmds)) { this._protos.delete(cmds) }
        } else {
            for (let i = 0; i < cmds.length; i++) {
                if (this._protos.has(cmds[i])) { this._protos.delete(cmds[i]) }
            }
        }
    }
}