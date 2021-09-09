
export function getClassName(obj: any | string) {
    let name = ""
    if (typeof obj == "function") {
        name = cc.js.getClassName(obj)
    } else { name = obj }
    return name
}