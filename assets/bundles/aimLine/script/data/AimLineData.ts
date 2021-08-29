import { GameData } from "../../../../scripts/framework/data/GameData";

class _AimLineData extends GameData {
    private static _instance: _AimLineData = null;
    public static Instance() { return this._instance || (this._instance = new _AimLineData()); }
    get bundle(){
        return "aimLine";
    }
}
export const AimLineData = getSingleton(_AimLineData);