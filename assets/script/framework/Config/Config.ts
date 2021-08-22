



export namespace LanguageConfig {
    /**@description 是否允许游戏启动后切换语言 */
    export const ENABLE_CHANGE_LANGUAGE = true;
    /**@description 语言包路径使用前缀 */
    export const USING_LAN_KEY = "i18n.";
}



export namespace MaskConfig {
    /**@description 是否启用全局Mask */
    export const Enable = true
    /**@description Mask透明度 */
    export const defaultOpacity = 120
    /**@description 遮罩的默认颜色 */
    export const defaultColor = "#000000"
}


/**
 * @description 界面层级定义
 */

export namespace ViewZOrder {


    /**@description 最底层 */
    export const zero = 0;

    /**@description 小喇叭显示层 */
    export const Horn = 10;

    /**@description ui层 */
    export const UI = 100;

    /**@description 提示 */
    export const Tips = 300;

    /**@description 提示弹出框 */
    export const Alert = 299;

    /**@description Loading层 */
    export const Loading = 600;

    /**@description 界面加载动画层，暂时放到最高层，加载动画时，界面未打开完成时，不让玩家点击其它地方 */
    export const UILoading = 700;
}


export enum GameLayer {
    //内容层
    Content = 0,
    Mask,
    Tips,
    Alert,
    Loading,
    UILoading
}

export const GameLayerNames: string[] = [
    "LayerContent", "Mask", "Tips", "Alert", "Loading", "UILoading"
]