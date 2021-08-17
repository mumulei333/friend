export namespace pomelo_Protocol {
    const PKG_HEAD_BYTES = 4

    export function strencode(str: string) {
        let byteArray = new Uint8Array(str.length * 3)
        let offset = 0
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i)
            let codes = null
            if (charCode <= 0x7f) {
                codes = [charCode]
            } else if (charCode <= 0x7ff) {
                codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)]
            } else {
                codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)]
            }
            for (let j = 0; j < codes.length; j++) {
                byteArray[offset] = codes[j]
                ++offset
            }
        }
        let _buffer = new Uint8Array(offset)
        copyArray(_buffer, 0, byteArray, 0, offset)
        return _buffer
    }

    /**
     * client decode
     * msg String data
     * return Message Object
     */
    export function strdecode(buffer: ArrayBuffer) {
        var bytes = new Uint8Array(buffer)
        var array = []
        var offset = 0
        var charCode = 0
        var end = bytes.length
        while (offset < end) {
            if (bytes[offset] < 128) {
                charCode = bytes[offset]
                offset += 1
            } else if (bytes[offset] < 224) {
                charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f)
                offset += 2
            } else {
                charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f)
                offset += 3
            }
            array.push(charCode)
        }
        return String.fromCharCode.apply(null, array)
    }

    export class Package {
        static TYPE_HANDSHAKE = 1
        static TYPE_HANDSHAKE_ACK = 2
        static TYPE_HEARTBEAT = 3
        static TYPE_DATA = 4
        static TYPE_KICK = 5
        /**
         * Package protocol encode.
         *
         * Pomelo package format:
         * +------+-------------+------------------+
         * | type | body length |       body       |
         * +------+-------------+------------------+
         *
         * Head: 4bytes
         *   0: package type,
         *      1 - handshake,
         *      2 - handshake ack,
         *      3 - heartbeat,
         *      4 - data
         *      5 - kick
         *   1 - 3: big-endian body length
         * Body: body length bytes
         *
         * @param  {Number}    type   package type
         * @param  {ByteArray} body   body content in bytes
         * @return {ByteArray}        new byte array that contains encode result
         */
        static encode(type: number, body?: Uint8Array) {
            var length = body ? body.length : 0
            var buffer = new Uint8Array(PKG_HEAD_BYTES + length)
            var index = 0
            buffer[index++] = type & 0xff
            buffer[index++] = (length >> 16) & 0xff
            buffer[index++] = (length >> 8) & 0xff
            buffer[index++] = length & 0xff
            if (body) {
                copyArray(buffer, index, body, 0, length)
            }
            return buffer
        }
        /**
         * Package protocol decode.
         * See encode for package format.
         *
         * @param  {ByteArray} buffer byte array containing package content
         * @return {Object}           {type: package type, buffer: body byte array}
         */
        static decode(buffer: Uint8Array): { type: number, body: any } {
            var offset = 0
            var bytes = new Uint8Array(buffer)
            var length = 0
            var rs = []
            while (offset < bytes.length) {
                var type = bytes[offset++]
                length = ((bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++]) >>> 0
                var body = length ? new Uint8Array(length) : null
                copyArray(body!, 0, bytes, offset, length)
                offset += length
                rs.push({ type: type, body: body })
            }
            return rs.length === 1 ? rs[0] : rs[0]
        }
    }

    function copyArray(dest: Uint8Array, doffset: number, src: Uint8Array, soffset: number, length: number) {
        // Uint8Array
        for (var index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++]
        }
    }
}