import { GameData } from "../GameVo/GameData";

export class GameDataManager {
    private _logTag = `[GameDataManager]`;
    private static _instance: GameDataManager = null;
    public static Instance() { return this._instance || (this._instance = new GameDataManager()); }

    private _datas: Map<string, GameData> = new Map()


    public Push(data: GameData) {
        let key = cc.js.getClassName(data)
        if (this._datas.has(cc.js.getClassName(data))) {
            return
        }
        this._datas.set(key, data)
    }

    public Remove(opt: GameData | string) {
        let key = ""
        if (typeof opt == "function") { key = cc.js.getClassName(opt) }
        else { key = opt as string }
        this._datas.delete(key)
    }

    public update(opt: GameData | string, obj: any) {
        let key = ""
        if (typeof opt == "function") { key = cc.js.getClassName(opt) }
        else { key = opt as string }
        let o = this._datas.get(key)
        o.update(obj)
    }
}


// export function writeData(dataName: string) {
//     return function (target, methodName: string) {
//         if (Reflect.getOwnPropertyDescriptor(target, "__autoData__") === undefined) {
//             let autoData = {}
//             if (Reflect.getPrototypeOf(target)['__autoData__']) {
//                 if (Reflect.getOwnPropertyDescriptor(target, "__autoData__") === undefined) {
//                     let parentAutoData = Reflect.getPrototypeOf(target)["__autoData__"]
//                     let autoDataKeys = Object.keys(parentAutoData)
//                     for (let len = autoDataKeys.length, i = 0; i < len; i++) {
//                         autoData[autoDataKeys[i]] = parentAutoData[autoDataKeys[i]].slice(0);
//                     }
//                 }
//             }
//             Reflect.defineProperty(target, '__autoData__', {
//                 value: autoData,
//             });
//         }
//         if (target['__autoData__'][dataName]) {
//             throw `SerializeKey has already been declared:${name}`;
//         }
//         target['__autoData__'][dataName] = methodName;
//     }
// }
