import { pomelo_Protocol } from "./protocol"

export class pomelo_message {
    static TYPE_REQUEST = 0
    static TYPE_NOTIFY = 1
    static TYPE_RESPONSE = 2
    static TYPE_PUSH = 3
    /**
     * Message protocol encode.
     *
     * @param  {Number} id            message id
     * @param  {Number} type          message type
     * @param  {Number} compressRoute whether compress route
     * @param  {Number|String} route  route code or route string
     * @param  {Uint8Array} msg           message body bytes
     * @return {Uint8Array}               encode result
     */
    static encode(id: number, type: number, compressRoute: number, route: any, msg: Uint8Array) {
        // caculate message max length
        let idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0
        let msgLen = MSG_FLAG_BYTES + idBytes

        if (msgHasRoute(type)) {
            if (compressRoute) {
                if (typeof route !== "number") {
                    throw new Error("error flag for number route!")
                }
                msgLen += MSG_ROUTE_CODE_BYTES
            } else {
                msgLen += MSG_ROUTE_LEN_BYTES
                if (route) {
                    route = pomelo_Protocol.strencode(route)
                    if (route.length > 255) {
                        throw new Error("route maxlength is overflow")
                    }
                    msgLen += route.length
                }
            }
        }

        if (msg) {
            msgLen += msg.length
        }

        let buffer = new Uint8Array(msgLen)
        let offset = 0

        // add flag
        offset = encodeMsgFlag(type, compressRoute, buffer, offset)

        // add message id
        if (msgHasId(type)) {
            offset = encodeMsgId(id, buffer, offset)
        }

        // add route
        if (msgHasRoute(type)) {
            offset = encodeMsgRoute(compressRoute, route, buffer, offset)
        }

        // add body
        if (msg) {
            offset = encodeMsgBody(msg, buffer, offset)
        }

        return buffer
    }

    /**
     * Message protocol decode.
     *
     * @param  {Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
    static decode(buffer: ArrayBuffer) {
        var bytes = new Uint8Array(buffer)
        var bytesLen = bytes.length || bytes.byteLength
        var offset = 0
        var id = 0
        var route = null

        // parse flag
        var flag = bytes[offset++]
        var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK
        var type = (flag >> 1) & MSG_TYPE_MASK

        // parse id
        if (msgHasId(type)) {
            var m = Number(bytes[offset])
            var i = 0
            do {
                var m = Number(bytes[offset])
                id = id + (m & 0x7f) * Math.pow(2, 7 * i)
                offset++
                i++
            } while (m >= 128)
        }

        // parse route
        if (msgHasRoute(type)) {
            if (compressRoute) {
                route = (bytes[offset++] << 8) | bytes[offset++]
            } else {
                var routeLen = bytes[offset++]
                if (routeLen) {
                    route = new Uint8Array(routeLen)
                    copyArray(route, 0, bytes, offset, routeLen)
                    route = pomelo_Protocol.strdecode(route)
                } else {
                    route = ""
                }
                offset += routeLen
            }
        }

        // parse body
        var bodyLen = bytesLen - offset
        var body = new Uint8Array(bodyLen)

        copyArray(body, 0, bytes, offset, bodyLen)

        return { id: id, type: type, compressRoute: compressRoute, route: route, body: body }
    }
}

function copyArray(dest: Uint8Array, doffset: number, src: Uint8Array, soffset: number, length: number) {
    // Uint8Array
    for (var index = 0; index < length; index++) {
        dest[doffset++] = src[soffset++]
    }
}

function encodeMsgBody(msg: any, buffer: Uint8Array, offset: number) {
    copyArray(buffer, offset, msg, 0, msg.length)
    return offset + msg.length
}

function encodeMsgRoute(compressRoute: number, route: any, buffer: Uint8Array, offset: number) {
    if (compressRoute) {
        if (route > MSG_ROUTE_CODE_MAX) {
            throw new Error("route number is overflow")
        }

        buffer[offset++] = (route >> 8) & 0xff
        buffer[offset++] = route & 0xff
    } else {
        if (route) {
            buffer[offset++] = route.length & 0xff
            copyArray(buffer, offset, route, 0, route.length)
            offset += route.length
        } else {
            buffer[offset++] = 0
        }
    }

    return offset
}

function encodeMsgId(id: number, buffer: Uint8Array, offset: number) {
    do {
        var tmp = id % 128
        var next = Math.floor(id / 128)

        if (next !== 0) {
            tmp = tmp + 128
        }
        buffer[offset++] = tmp

        id = next
    } while (id !== 0)

    return offset
}

function encodeMsgFlag(type: number, compressRoute: number, buffer: Uint8Array, offset: number) {
    if (type !== pomelo_message.TYPE_REQUEST && type !== pomelo_message.TYPE_NOTIFY && type !== pomelo_message.TYPE_RESPONSE && type !== pomelo_message.TYPE_PUSH) {
        throw new Error("unkonw message type: " + type)
    }

    buffer[offset] = (type << 1) | (compressRoute ? 1 : 0)

    return offset + MSG_FLAG_BYTES
}

function msgHasRoute(type: number) {
    return type === pomelo_message.TYPE_REQUEST || type === pomelo_message.TYPE_NOTIFY || type === pomelo_message.TYPE_PUSH
}
function caculateMsgIdBytes(id: number) {
    var len = 0
    do {
        len += 1
        id >>= 7
    } while (id > 0)
    return len
}
function msgHasId(type: number) {
    return type === pomelo_message.TYPE_REQUEST || type === pomelo_message.TYPE_RESPONSE
}
const PKG_HEAD_BYTES = 4
const MSG_FLAG_BYTES = 1
const MSG_ROUTE_CODE_BYTES = 2
const MSG_ID_MAX_BYTES = 5
const MSG_ROUTE_LEN_BYTES = 1
const MSG_ROUTE_CODE_MAX = 0xffff
const MSG_COMPRESS_ROUTE_MASK = 0x1
const MSG_TYPE_MASK = 0x7
