import { pomelo_Protocol } from "./MessagePackage/protocol"

export class PomeloData {
    static package: typeof pomelo_Protocol.Package = pomelo_Protocol.Package
    static reqId: number = 0
    static clientProtos: any = {}
    static dict: { [keyof: string]: string } | null = {}
    static routeMap: { [key: number]: string } = {}
    static abbrs: { [keyof: string]: string } = {}
    static serverProtos: any = {}
}