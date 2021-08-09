export class pomelo_protobuf {
    static init(opts: any) {
        encoder.init(opts.encoderProtos)
        decoder.init(opts.decoderProtos)
    }

    static encode(key, msg) {
        return encoder.encode(key, msg)
    }

    static decode(key, msg) {
        return decoder.decode(key, msg)
    }
}

class encoder {
    public static protos = null
    static init(protos) {
        this.protos = protos || {}
    }
    static encode(route, msg) {
        let protos = this.protos[route]
        if (!this._checkMsg(msg, protos)) {
            return null
        }

        //Set the length of the buffer 2 times bigger to prevent overflow
        let length = Codec.byteLength(JSON.stringify(msg))
        let buffer = new ArrayBuffer(length)
        let uInt8Array = new Uint8Array(buffer)
        let offset = 0
        if (!!protos) {
            offset = this.encodeMsg(uInt8Array, offset, protos, msg)
            if (offset > 0) {
                return uInt8Array.subarray(0, offset)
            }
        }
        return null
    }

    private static _checkMsg(msg, protos) {
        if (!protos) {
            return false
        }
        for (let name in protos) {
            let proto = protos[name]
            switch (proto.option) {
                case "required":
                    if (typeof msg[name] === "undefined") {
                        console.warn("no property exist for required! name: %j, proto: %j, msg: %j", name, proto, msg)
                        return false
                    }
                case "optional":
                    if (typeof msg[name] !== "undefined") {
                        var message = protos.__messages[proto.type] || encoder.protos["message " + proto.type]
                        if (!!message && !this._checkMsg(msg[name], message)) {
                            console.warn("inner proto error! name: %j, proto: %j, msg: %j", name, proto, msg)
                            return false
                        }
                    }
                    break
                case "repeated":
                    //Check nest message in repeated elements
                    var message = protos.__messages[proto.type] || encoder.protos["message " + proto.type]
                    if (!!msg[name] && !!message) {
                        for (var i = 0; i < msg[name].length; i++) {
                            if (!this._checkMsg(msg[name][i], message)) {
                                return false
                            }
                        }
                    }
                    break
            }
        }
        return true
    }

    private static encodeMsg(buffer, offset, protos, msg) {
        for (var name in msg) {
            if (!!protos[name]) {
                var proto = protos[name]

                switch (proto.option) {
                    case "required":
                    case "optional":
                        offset = this.writeBytes(buffer, offset, this.encodeTag(proto.type, proto.tag))
                        offset = this.encodeProp(msg[name], proto.type, offset, buffer, protos)
                        break
                    case "repeated":
                        if (msg[name].length > 0) {
                            offset = this.encodeArray(msg[name], proto, offset, buffer, protos)
                        }
                        break
                }
            }
        }

        return offset
    }

    private static encodeProp(value, type, offset, buffer, protos?: any) {
        switch (type) {
            case "uInt32":
                offset = this.writeBytes(buffer, offset, Codec.encodeUInt32(value))
                break
            case "int32":
            case "sInt32":
                offset = this.writeBytes(buffer, offset, Codec.encodeSInt32(value))
                break
            case "float":
                this.writeBytes(buffer, offset, Codec.encodeFloat(value))
                offset += 4
                break
            case "double":
                this.writeBytes(buffer, offset, Codec.encodeDouble(value))
                offset += 8
                break
            case "string":
                var length = Codec.byteLength(value)

                //Encode length
                offset = this.writeBytes(buffer, offset, Codec.encodeUInt32(length))
                //write string
                Codec.encodeStr(buffer, offset, value)
                offset += length
                break
            default:
                var message = protos.__messages[type] || encoder.protos["message " + type]
                if (!!message) {
                    //Use a tmp buffer to build an internal msg
                    var tmpBuffer = new ArrayBuffer(Codec.byteLength(JSON.stringify(value)) * 2)
                    var length = 0

                    length = this.encodeMsg(tmpBuffer, length, message, value)
                    //Encode length
                    offset = this.writeBytes(buffer, offset, Codec.encodeUInt32(length))
                    //contact the object
                    for (var i = 0; i < length; i++) {
                        buffer[offset] = tmpBuffer[i]
                        offset++
                    }
                }
                break
        }

        return offset
    }

    private static encodeArray(array, proto, offset, buffer, protos) {
        var i = 0

        if (isSimpleType(proto.type)) {
            offset = this.writeBytes(buffer, offset, this.encodeTag(proto.type, proto.tag))
            offset = this.writeBytes(buffer, offset, Codec.encodeUInt32(array.length))
            for (i = 0; i < array.length; i++) {
                offset = this.encodeProp(array[i], proto.type, offset, buffer)
            }
        } else {
            for (i = 0; i < array.length; i++) {
                offset = this.writeBytes(buffer, offset, this.encodeTag(proto.type, proto.tag))
                offset = this.encodeProp(array[i], proto.type, offset, buffer, protos)
            }
        }

        return offset
    }

    private static encodeTag(type, tag) {
        var value = constant.TYPES[type] || 2

        return Codec.encodeUInt32((tag << 3) | value)
    }

    private static writeBytes(buffer, offset, bytes) {
        for (var i = 0; i < bytes.length; i++, offset++) {
            buffer[offset] = bytes[i]
        }

        return offset
    }
}

class decoder {
    public static protos = null
    private static buffer
    private static offset = 0
    static init(protos) {
        this.protos = protos || {}
    }
    static setProtos(protos) {
        if (!!protos) {
            this.protos = protos
        }
    }
    static decode(route, buf) {
        var protos = this.protos[route]

        this.buffer = buf
        this.offset = 0

        if (!!protos) {
            return this.decodeMsg({}, protos, this.buffer.length)
        }

        return null
    }

    private static decodeMsg(msg, protos, length) {
        while (this.offset < length) {
            var head = this.getHead()
            var type = head.type
            var tag = head.tag
            var name = protos.__tags[tag]

            switch (protos[name].option) {
                case "optional":
                case "required":
                    msg[name] = this.decodeProp(protos[name].type, protos)
                    break
                case "repeated":
                    if (!msg[name]) {
                        msg[name] = []
                    }
                    this.decodeArray(msg[name], protos[name].type, protos)
                    break
            }
        }

        return msg
    }

    private static getHead() {
        var tag = Codec.decodeUInt32(this.getBytes())

        return {
            type: tag & 0x7,
            tag: tag >> 3,
        }
    }

    private static getBytes(flag?) {
        var bytes = []
        var pos = this.offset
        flag = flag || false

        var b

        do {
            b = this.buffer[pos]
            bytes.push(b)
            pos++
        } while (b >= 128)

        if (!flag) {
            this.offset = pos
        }
        return bytes
    }

    private static decodeProp(type, protos?) {
        switch (type) {
            case "uInt32":
                return Codec.decodeUInt32(this.getBytes())
            case "int32":
            case "sInt32":
                return Codec.decodeSInt32(this.getBytes())
            case "float":
                var float = Codec.decodeFloat(this.buffer, this.offset)
                this.offset += 4
                return float
            case "double":
                var double = Codec.decodeDouble(this.buffer, this.offset)
                this.offset += 8
                return double
            case "string":
                var length = Codec.decodeUInt32(this.getBytes())
                var str = Codec.decodeStr(this.buffer, this.offset, length)
                this.offset += length

                return str
            default:
                var message = protos && (protos.__messages[type] || this.protos["message " + type])
                if (!!message) {
                    var length = Codec.decodeUInt32(this.getBytes())
                    var msg = {}
                    this.decodeMsg(msg, message, this.offset + length)
                    return msg
                }
                break
        }
    }

    private static decodeArray(array, type, protos) {
        if (isSimpleType(type)) {
            var length = Codec.decodeUInt32(this.getBytes())

            for (var i = 0; i < length; i++) {
                array.push(this.decodeProp(type))
            }
        } else {
            array.push(this.decodeProp(type, protos))
        }
    }
}

var buffer = new ArrayBuffer(8)
var float32Array = new Float32Array(buffer)
var float64Array = new Float64Array(buffer)
var uInt8Array = new Uint8Array(buffer)

class Codec {
    static encodeUInt32(n) {
        n = parseInt(n)
        if (isNaN(n) || n < 0) {
            return null
        }

        var result = []
        do {
            var tmp = n % 128
            var next = Math.floor(n / 128)

            if (next !== 0) {
                tmp = tmp + 128
            }
            result.push(tmp)
            n = next
        } while (n !== 0)

        return result
    }

    static encodeSInt32(n) {
        n = parseInt(n)
        if (isNaN(n)) {
            return null
        }
        n = n < 0 ? Math.abs(n) * 2 - 1 : n * 2

        return this.encodeUInt32(n)
    }

    static decodeUInt32(bytes) {
        var n = 0

        for (var i = 0; i < bytes.length; i++) {
            var m = parseInt(bytes[i])
            n = n + (m & 0x7f) * Math.pow(2, 7 * i)
            if (m < 128) {
                return n
            }
        }

        return n
    }

    static decodeSInt32(bytes) {
        var n = this.decodeUInt32(bytes)
        var flag = n % 2 === 1 ? -1 : 1

        n = (((n % 2) + n) / 2) * flag

        return n
    }

    static encodeFloat(float) {
        float32Array[0] = float
        return uInt8Array
    }

    static decodeFloat(bytes, offset) {
        if (!bytes || bytes.length < offset + 4) {
            return null
        }

        for (var i = 0; i < 4; i++) {
            uInt8Array[i] = bytes[offset + i]
        }

        return float32Array[0]
    }

    static encodeDouble(double) {
        float64Array[0] = double
        return uInt8Array.subarray(0, 8)
    }

    static decodeDouble(bytes, offset) {
        if (!bytes || bytes.length < offset + 8) {
            return null
        }

        for (var i = 0; i < 8; i++) {
            uInt8Array[i] = bytes[offset + i]
        }

        return float64Array[0]
    }

    static encodeStr(bytes, offset, str) {
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i)
            var codes = this.encode2UTF8(code)

            for (var j = 0; j < codes.length; j++) {
                bytes[offset] = codes[j]
                offset++
            }
        }

        return offset
    }

    /**
     * Decode string from utf8 bytes
     */
    static decodeStr(bytes, offset, length) {
        var array = []
        var end = offset + length

        while (offset < end) {
            var code = 0

            if (bytes[offset] < 128) {
                code = bytes[offset]

                offset += 1
            } else if (bytes[offset] < 224) {
                code = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f)
                offset += 2
            } else {
                code = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f)
                offset += 3
            }

            array.push(code)
        }

        var str = ""
        for (var i = 0; i < array.length;) {
            str += String.fromCharCode.apply(null, array.slice(i, i + 10000))
            i += 10000
        }

        return str
    }

    /**
     * Return the byte length of the str use utf8
     */
    static byteLength(str) {
        if (typeof str !== "string") {
            return -1
        }

        var length = 0

        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i)
            length += this.codeLength(code)
        }

        return length
    }

    private static encode2UTF8(charCode) {
        if (charCode <= 0x7f) {
            return [charCode]
        } else if (charCode <= 0x7ff) {
            return [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)]
        } else {
            return [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)]
        }
    }

    private static codeLength(code) {
        if (code <= 0x7f) {
            return 1
        } else if (code <= 0x7ff) {
            return 2
        } else {
            return 3
        }
    }
}

function isSimpleType(type) {
    return type === "uInt32" || type === "sInt32" || type === "int32" || type === "uInt64" || type === "sInt64" || type === "float" || type === "double"
}

const constant = {
    TYPES: {
        uInt32: 0,
        sInt32: 0,
        int32: 0,
        double: 1,
        string: 2,
        message: 2,
        float: 5,
    },
}
