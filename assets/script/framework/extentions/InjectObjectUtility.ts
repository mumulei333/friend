import { InjectData } from "./InjectData"

type obj = { [key: string]: any }
export class InjectObjectUtility {
    public static SetProperty(target: obj, source: obj): void {
        for (let property in source) {
            target[property] = source[property]
        }
    }

    public static Analysis(thisObj: any, target: obj, source: obj, customSetProperty: Function, unOwnProperty: Function, customPropertys: any[])
        : void {
        if (source == null) { return }
        for (let property in source) {
            if (Reflect.has(target, property)) {
                if (customPropertys.length == 0 || customPropertys.indexOf(property) == -1) {
                    if (target[property] != source[property]) { target[property] = source[property] }
                } else {
                    if (customSetProperty != null) { customSetProperty.call(thisObj, target, source, property) }
                }
            } else {
                if (unOwnProperty != null) { unOwnProperty.call(thisObj, target, source, property) }
            }
        }
    }

    public static CloneObject<T extends Object>(source: T): any { }

    public static ToArray(v: any): any[] {
        var arr = []
        for (let i = 0; i < v.length; i++) {
            arr[i] = v[i]
        }
        return arr
    }

    public static TransformObjectVector(data: any, clz: any): any[] {
        if (data && Reflect.has(data, "length")) {
            var arr: any[] = []
            for (var i: number = 0; i < data.length; i++) {
                if (clz == String || clz == Number || clz == Boolean) arr.push(data[i])
                else {
                    var v: any = new clz()
                    if (v instanceof InjectData) v.update(data[i])
                    else this.Analysis(this, v, data[i], this.CustomSetProperty, this.CustomSetProperty, [])
                    arr.push(v)
                }
            }
            return arr
        }
        return []
    }

    private static CustomSetProperty(thisObj: object, data: object, property: string): void { }
}