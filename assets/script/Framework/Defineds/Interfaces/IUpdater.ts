import { HotUpdateEnums } from "../Enums/HotUpdateEnums";




export namespace IUpdater {
    export interface IDownLoadInfo {
        /**@description 下载当前数据大小 */
        downloadedBytes: number,
        /**@description 下载数据总大小 */
        totalBytes: number,
        /**@description 当前下载文件数量 */
        downloadedFiles: number,
        /**@description 当前下载的总文件数量 */
        totalFiles: number,
        /**@description 下载总进入 */
        percent: number,
        /**@description 下载当前文件的进度 */
        percentByFile: number,
        /**@description 下载Code */
        code: HotUpdateEnums.Code,
        /**@description 下载State */
        state: HotUpdateEnums.State,
        /**@description 是否需要重启 */
        needRestart: boolean
        /**@description 当前正在下载或更新的子游戏 */
        name: string
    }

    export interface UpdaterOption {
        manifestRoot: string
        name: string
        isSkip: boolean //是否可以跳过版本更新
        updateAddress: string
        isMain: boolean
    }


    export type updateCallback = (code: HotUpdateEnums.Code, state: HotUpdateEnums.State) => void
}