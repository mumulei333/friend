/**
 * @description 子游戏连接服务
 */
import { PomeloSocket } from "./PomeloSocket";

export class PinusGameService extends PomeloSocket {
    public static get instance() { return this._instance || (this._instance = new PinusGameService()); }
    public serviceName = "Pinus Game Server";
    protected ip = "106.53.33.234";
    protected port = 3100
}


function _request(route: string, msg: { [keyof: string]: any }) {
    PinusGameService.instance.request(route, msg)
}


function _listenet(event: string, fn: Function): void {
    PinusGameService.instance.listenet(event, fn)
}

function _notify(route: string, msg: { [keyof: string]: any }) {
    PinusGameService.instance.notify(route, msg)
}





window["pinus"] = { request: _request, listenet: _listenet, notify: _notify, test: PinusGameService }

