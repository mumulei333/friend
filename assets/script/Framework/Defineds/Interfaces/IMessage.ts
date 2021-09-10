export abstract class AbstractMessage {
    //等待发送数据
    abstract getData(): any
    abstract getCmdID(): string
}

export abstract class AbstractCodec extends AbstractMessage {
    /** 编码数据 */
    abstract pack(data: any): boolean
    /** 解码数据 */
    abstract unPack(data: any): boolean
}


export abstract class AbstractSerialize extends AbstractMessage {
    /** 序列化数据 */
    abstract Serialize(): boolean
    /** 反序列化数据 */
    abstract Deserialize(data: any): boolean
}