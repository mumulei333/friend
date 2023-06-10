import { Macro } from "../../framework/defines/Macros";

/**
 * @description 语言包用到，定义好之前，请不要随意修改顺序，以免读取语言包错误
 */
enum Types {
    aimLine,
    eliminate,
    loadTest,
    netTest,
    nodePoolTest,
    tankBattle,
    shaders,
    resources,
    hall,
    scratchTicket,
    escapeStation,
    snapshot,
    stateMachine,
}

const eTypes = cc.Enum(Types)

interface BundleData {
    /**@description 语言包路径 */
    language: string;
    /**@description Bundle名 */
    bundle: string;
    /**@description 是否有私有 */
    isPrivate: boolean;
}

interface DataT {
    name: { CN: string, EN: string };
    bundle: string;
    sort: number;
}

//排序
enum Sort {
    resources = 0,
    hall,
    aimLine,
    eliminate,
    loadTest,
    netTest,
    tankBattle,
    shaders,
    nodePoolTest,
    scratchTicket,
    snapshot,
    stateMachine,
    //私有项目
    private,
    escapeStation,
}

const _datas: DataT[] = [
    { sort: Sort.aimLine, name: { CN: "瞄准线", EN: "Aim Line" }, bundle: eTypes[Types.aimLine] },
    { sort: Sort.eliminate, name: { CN: "爱消除", EN: "Eliminate" }, bundle: eTypes[Types.eliminate] },
    { sort: Sort.loadTest, name: { CN: "加载示例", EN: "Load Test" }, bundle: eTypes[Types.loadTest] },
    { sort: Sort.netTest, name: { CN: "网络示例", EN: "Net Test" }, bundle: eTypes[Types.netTest] },
    { sort: Sort.nodePoolTest, name: { CN: "对象池示例", EN: "Node Pool" }, bundle: eTypes[Types.nodePoolTest] },
    { sort: Sort.tankBattle, name: { CN: "坦克大战", EN: "BATTLE\nCITY" }, bundle: eTypes[Types.tankBattle] },
    { sort: Sort.shaders, name: { CN: "Shaders", EN: "Shaders" }, bundle: eTypes[Types.shaders] },
    { sort: Sort.resources, name: { CN: "主包", EN: "Main" }, bundle: eTypes[Types.resources] },
    { sort: Sort.hall, name: { CN: "大厅", EN: "Hall" }, bundle: eTypes[Types.hall] },
    { sort: Sort.scratchTicket, name: { CN: "刮奖", EN: "Scratch\nTicket" }, bundle: eTypes[Types.scratchTicket] },
    { sort: Sort.snapshot, name: { CN: "截图", EN: "Snapshot" }, bundle: eTypes[Types.snapshot] },
    { sort: Sort.escapeStation, name: { CN: "逃离车站", EN: "Escape\nStation" }, bundle: eTypes[Types.escapeStation] },
    { sort: Sort.stateMachine, name: { CN: "状态机", EN: "State\nMachine" }, bundle: eTypes[Types.stateMachine] },
];

// console.log(_datas);

export class Bundles {
    static bundles = Types;
    private static _games: BundleData[] = [];
    /**
     * @description 初始化
     */
    static init() {
        this._games = [];
        this.datas.sort((a, b) => {
            return a.sort - b.sort;
        });

        this.datas.forEach(v => {
            if (!(v.bundle == Macro.BUNDLE_HALL || v.bundle == Macro.BUNDLE_RESOURCES)) {
                let data: BundleData = {
                    bundle: v.bundle,
                    isPrivate: v.sort >= Sort.private,
                    language: `bundles.${v.bundle}`
                }
                this._games.push(data);
            }
        });
    }

    /**
     * @description 通过bundle名获取语言包key
     * @param bundle 
     * @returns 
     */
    static getLanguage(bundle: string) {
        return `bundles.${bundle}`;
    }

    /**
     * @description bundles配置数据
     */
    static get datas() {
        return _datas;
    }
    /**@description 所有子游戏配置 */
    static get games() {
        return this._games;
    }
}
