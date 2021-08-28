import { ICommonService } from "../../../framework/Support/Service/ICommonService";

export class CommonService extends ICommonService {
    protected static _instance: CommonService = null!;
    protected isHeartBeat(data: Socket.IMessage): boolean {
        return false
    }
    protected ip = ""
    protected port: number = null!;
    protected protocol: WebSocketType = "ws"

    public connect() {
        super.connect_server(this.ip, this.port, this.protocol);
    }
}