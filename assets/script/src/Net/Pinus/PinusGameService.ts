import { PomeloService } from '../../../Common/Net/Pomelo/PomeloService';
export class PinusGameService extends PomeloService {
    public static get instance() { return this._instance || (this._instance = new PinusGameService()); }
    public serviceName = "Pinus Game Server";
    protected ip = "106.53.33.234";
    protected port = 3100


    protected startListener() {
        this.listenet("helloWorld", this._helloWorld)
    }


    private _helloWorld(data: { code: number, data: any }) {
        dispatch("HelloWorld", data.data)
    }
}
