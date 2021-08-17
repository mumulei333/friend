
import { Config } from "../../../../script/common/config/Config";
import { GameData } from "../../../../script/common/base/GameData";
/**@description 大厅数据 */
class _HallData extends GameData {
    private static _instance: _HallData = null;
    public static Instance() { return this._instance || (this._instance = new _HallData()); }

    get bundle() {
        return Config.BUNDLE_HALL;
    }

    chairID: number = 0;
    faceID: number = 0
    gameID: number = 0
    head: string = ""
    nickname: string = ""
    online: number = 0
    otherInfo: any = 0
    score: number = 0
    sex: number = 0
    tableID: number = 0
    userID: number = 0
    userStatus: number = 0
    vipLevel: number = 0
    diamond: number = 0
}
export const HallData = getSingleton(_HallData)
