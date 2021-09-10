
export function getClassName(obj: any | string) {
    let name = ""
    if (typeof obj == "function" || (obj && obj.constructor)) {
        name = cc.js.getClassName(obj)
    } else { name = obj }
    return name
}