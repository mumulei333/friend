import { GameConfig } from "../../../../Common/Config/GameConfig";
import { Buffer } from "../../../../Plugins/Buffer";
import { MessageHeader } from "./BaseMessage/MessageHeader";

export class StreamMessage extends MessageHeader {
    type: Socket.MessageType = "Stream"
    textarea: string;
    /**@description 消息主cmd码 */
    mainCmd: number = 0;
    /**@description 消息子cmd码 */
    subCmd: number = 0;
    /**@description 数据buffer */
    buffer: Uint8Array = null;
    /**@description 数据大小 */
    private _dataSize: number = 0;
    /**
     * @description 通过当前数据包体，拼接数据包头，mainCmd subCmd 还在Message中
     * @param msg 数据体对象
     */
    encode(msg: MessageStruct): boolean {
        this.mainCmd = msg.mainCmd;
        this.subCmd = msg.subCmd;
        this._dataSize = 0;
        let offset = 0;

        /**第二种写法 */
        let data = null;
        if (msg.buffer) {
            data = Buffer.from(msg.buffer);
            this._dataSize = msg.buffer.length;
        }
        let buffer = Buffer.alloc(this.size);
        if (GameConfig.NETWORK_STREAM_USING_LITTLE_ENDIAN) {
            //小端处理
            buffer.writeUInt32LE(this.mainCmd, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
            buffer.writeUInt32LE(this.subCmd, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
            buffer.writeUInt32LE(this._dataSize, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
        } else {
            buffer.writeUInt32BE(this.mainCmd, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
            buffer.writeUInt32BE(this.subCmd, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
            buffer.writeUInt32BE(this._dataSize, offset)
            offset += Uint32Array.BYTES_PER_ELEMENT;
        }
        if (data) {
            data.copy(buffer, this.headerSize);
        }
        let result = buffer;

        this.buffer = result as any;
        return true;
    }
    /**
     * @description 解析mainCmd subCmd 到Message中，返回数据包体数据流 
     * @param data 网络数据流
     * @param msg 数据体对象，主要用来取出 mainCmd subCmd
     */
    decode(data: Uint8Array): boolean {
        let dataView = new DataView(data.buffer);
        //取包头
        let offset = 0;
        this.mainCmd = dataView.getUint32(offset, GameConfig.NETWORK_STREAM_USING_LITTLE_ENDIAN);
        offset += Uint32Array.BYTES_PER_ELEMENT;
        this.subCmd = dataView.getUint32(offset, GameConfig.NETWORK_STREAM_USING_LITTLE_ENDIAN);
        offset += Uint32Array.BYTES_PER_ELEMENT;
        this._dataSize = dataView.getUint32(offset, GameConfig.NETWORK_STREAM_USING_LITTLE_ENDIAN);
        offset += Uint32Array.BYTES_PER_ELEMENT;
        let buffer = dataView.buffer.slice(offset, dataView.buffer.byteLength)
        this.buffer = new Uint8Array(buffer);
        return this._dataSize == this.buffer.length;
    }

    /**@description 总数据大小 */
    get size() { return this._dataSize + this.headerSize }

    /**@description 包体大小 */
    get dataSize() { return this._dataSize }

    /**@description 包头大小 */
    get headerSize() {
        return 3 * Uint32Array.BYTES_PER_ELEMENT;
    }

    getExcutName(): string {
        return this.mainCmd + this.subCmd + ""
    }
}

interface MessageStruct {
    mainCmd: number
    subCmd: number
    buffer: Uint8Array
}