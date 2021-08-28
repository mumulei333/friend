import { CommonService } from './../../../Common/Net/Service/CommonService';
export class EchoService extends CommonService {

    public static get instance() { return this._instance || (this._instance = new EchoService()); }
    public serviceName = "聊天";
    protected ip = "localhost";
    protected port = 9091
}