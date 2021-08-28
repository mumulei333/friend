import { JsonMessage } from "../../Message/Json/JsonMessage";

export class PomeloRequestMessage extends JsonMessage {

    private _tmp: any = null
    public get Data() { return this._tmp }

    public Encode() {
        this._tmp = this.serialize();
        // let result = JSON.stringify(this._tmp);
        return true;
    }
    //子JSON可以不用管这个字段
    get isRequest(): boolean { return true }
}