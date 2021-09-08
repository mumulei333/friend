

export namespace HotUpdateEnums {
    export enum Code {
        /**@description 找不到本地mainfest文件*/
        ERROR_NO_LOCAL_MANIFEST,
        /**@description 下载manifest文件错误 */
        ERROR_DOWNLOAD_MANIFEST,
        /**@description 解析manifest文件错误 */
        ERROR_PARSE_MANIFEST,
        /**@description 找到新版本 */
        NEW_VERSION_FOUND,
        /**@description 当前已经是最新版本 */
        ALREADY_UP_TO_DATE,
        /**@description 更新下载进度中 */
        UPDATE_PROGRESSION,
        /**@description 资源更新中 */
        ASSET_UPDATED,
        /**@description 更新错误 */
        ERROR_UPDATING,
        /**@description 更新完成 */
        UPDATE_FINISHED,
        /**@description 更新失败 */
        UPDATE_FAILED,
        /**@description 解压资源失败 */
        ERROR_DECOMPRESS,

        //以下是js中扩展的字段，上面是引擎中已经有的字段
        /**@description 正检测更新中 */
        CHECKING,
    }

    export enum State {
        /**@description 未初始化 */
        UNINITED,
        /**@description 找到manifest文件 */
        UNCHECKED,
        /**@description 准备下载版本文件 */
        PREDOWNLOAD_VERSION,
        /**@description 下载版本文件中 */
        DOWNLOADING_VERSION,
        /**@description 版本文件下载完成 */
        VERSION_LOADED,
        /**@description 准备加载project.manifest文件 */
        PREDOWNLOAD_MANIFEST,
        /**@description 下载project.manifest文件中 */
        DOWNLOADING_MANIFEST,
        /**@description 下载project.manifest文件完成 */
        MANIFEST_LOADED,
        /**@description 需要下载更新 */
        NEED_UPDATE,
        /**@description 准备更新 */
        READY_TO_UPDATE,
        /**@description 更新中 */
        UPDATING,
        /**@description 解压中 */
        UNZIPPING,
        /**@description 已经是最新版本 */
        UP_TO_DATE,
        /**@description 更新失败 */
        FAIL_TO_UPDATE,

        /**自定定义扩展 */
        /**@description 尝试重新下载失败文件 */
        TRY_DOWNLOAD_FAILED_ASSETS,
    }
}