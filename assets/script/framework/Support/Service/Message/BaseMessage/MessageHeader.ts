export class MessageHeader implements Socket.IMessage {
    buffer: Uint8Array = null;
    encode(dat: any): boolean { return false }
    decode(data: Uint8Array | string): boolean { return false }
    /**@description 总数据大小 */
    get size(): number { return 0 }

    /**@description 包体大小 */
    get dataSize() { return 0 }

    /**@description 包头大小 */
    get headerSize() { return 0 }

    get CmdName(): string { return "" }

    get data(): Uint8Array | string { return "" }
}

