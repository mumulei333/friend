export abstract class Codec {
    //等待发送数据
    abstract get Data(): any

    //编码数据
    abstract Pack(data: any): boolean

    //解码数据
    abstract UnPack(data: any): boolean

    abstract get MsgID(): string
}


export abstract class Message {
    //等待处理数据
    abstract get Data(): any

    //编码数据
    abstract Encode(): boolean

    //解码数据
    abstract Decode(data: any): boolean

    abstract get MsgID(): string
}