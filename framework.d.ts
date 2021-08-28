declare module cc {
    function dump(...args);
    //相当于console.info //引擎已经设置为只读，没办法在取一个一样的名字
    function message(...args);

    /**@description 相当于console.time */
    function time(...args);

    /**@description 相当于console.timeEnd */
    function timeEnd(...args);

    interface Node {
        /**@description 用户自定义数据 */
        userData: any;
    }

    /**
       * @description 强制节点在当前帧进行一次布局 
       * @example
     * cc.updateAlignment(this.node);
     * */
    export function updateAlignment(node: cc.Node): void;
}
declare type WebSocketType = "ws" | "wss"
declare function log(...args: any[]): void;
declare function error(...args: any[]): void;
declare function warn(...args: any[]): void;

declare namespace types {
    type EventCallBack = ((data: any) => void) | string

    type StorageVauleType = number | string | boolean | object;


}

declare namespace interfaces {
    interface IEvent {
        type: string                                //事件类型
        target: any                                 //目标class
        callback: ((data: any) => void) | string    //事件回调
    }
    interface StorageData {
        type: types.StorageVauleType
        value: types.StorageVauleType
    }
}

declare interface DateConstructor {
    /**
     * @description 返回当前时间的秒数
     * @example 
     * Date.timeNow()
     *  */
    timeNow(): number;
    /**
     * @description 返回当前时间的毫秒数 
     * @example 
     * Date.timeNowMillisecons()
     * */
    timeNowMillisecons(): number;
}

declare interface StringConstructor {
    /**
     * @description 格式化字符串
     * @example
     * String.format("{0}-->{1}-->{2}","one","two","three") | String.format("{0}-->{1}-->{2}",["one","two","three"])
     * => "one-->two-->three"
     * */
    format(...args): string;
}

class FrameworkManager {
    readonly eventDispatcher: import("./assets/script/framework/Support/Event/EventDispatcher").EventDispatcher
    //td.EventDispatcher
    readonly localStorage: import("./assets/script/framework/Support/Storage/LocalStorage").LocalStorage
    readonly assetManager: import("./assets/script/framework/Support/AssetManager/AssetManager").AssetManager
    readonly cacheManager: import("./assets/script/framework/Support/AssetManager/CacheManager").CacheManager
    readonly resolutionHelper: import("./assets/script/framework/Support/Adaptor/ResolutionHelper").ResolutionHelper
    readonly nodePoolManager: import("./assets/script/framework/Support/NodePool/NodePool").NodePoolManager
    readonly uiManager: import("./assets/script/framework/Support/UI/UIManager").UIManager
    readonly serviceManager: import("./assets/script/Common/Manager/ServiceManager").ServiceManager
    readonly loading: import("./assets/script/Common/Component/Loading").Loading
    readonly layer: import("./assets/script/framework/Support/Layer/LayerManager").LayerManager
    /**@description 提示框 */
    readonly alert: import("./assets/script/Common/Component/Alert").Alert;
    /**@description 语言包 */
    readonly language: import("./assets/script/framework/Support/Language/Language").Language;
    readonly tips: import("./assets/script/Common/Component/Tips").Tips
    readonly uiLoading: import("./assets/script/Common/Component/UILoading").default
    readonly netManager: import("./assets/script/Common/Manager/NetManager").NetManager
    readonly logicManager: import("./assets/script/Common/Manager/LogicManager").LogicManager
    readonly bundleManager: import("./assets/script/Common/Manager/BundleManager").BundleManager
    readonly gameDataManager: import("./assets/script/Common/Manager/GameDataManager").GameDataManager
    gameController: any

    /**
          * @description 获取语言包 
          */
    getLanguage(param: string | (string | number)[], bundle?: td.Resource.BUNDLE_TYPE): string;
}


declare interface Singleton<T> {
    new(): T
    Instance(): T
}

declare interface IFullScreenAdapt {
    /**@description 全屏幕适配 调用 */
    onFullScreenAdapt(): void;
}

// declare interface UIClass<T extends UIView> {
//     new(): T;
//     /**
//      *@description 视图prefab 地址 resources目录下如z_panels/WeiZoneLayer 
//      */
//     getPrefabUrl(): string;
// }

declare interface GameEventInterface {

    /**@description 进入后台 cc.game.EVENT_HIDE*/
    onEnterBackground();

    /**
     * @description 进入前台 cc.game.EVENT_SHOW
     * @param inBackgroundTime 在后台运行的总时间，单位秒
     */
    onEnterForgeground(inBackgroundTime: number);
}

declare namespace UI {
    declare interface UIOpenOption {
        // type: UIClass<T>
        bundle?: td.Resource.BUNDLE_TYPE
        zIndex?: number
        layer?: number,
        args?: Array<any>
        delay?: number
        name?: string
        byPopup?: boolean
    }

    declare interface UIShowOption {
        data: Array<any>
    }

    declare interface addChildOption {
        node: cc.Node
        zIndex?: number
        layer?: number,
        adpater?: IFullScreenAdapt = null
    }
}

declare namespace Socket {
    declare type WebSocketType = "ws" | "wss";

    declare type MessageType = "JSON" | "Stream"

    interface ProtoListenerData {
        eventName: string
        func: MessageHandleFunc, //处理函数
        type: typeof Message, //解包类型
        isQueue: boolean,//是否进入消息队列，如果不是，收到网络消息返回，会立即回调处理函数
        data?: any, //解包后的数据
        target?: any, //处理者
    }

    interface IMessage {
        readonly Data: any
    }
}

/**@description 提示弹出框配置 */
declare interface AlertConfig {
    /**@description 用来标识弹出框，后面可指定tag进行关闭所有相同tag的弹出框 */
    tag?: string | number,
    /**@description 提示内容 richText只能二先1 */
    text?: string,
    /**@description 标题,默认为 : 温馨提示 */
    title?: string,
    /**@description 确定按钮文字 默认为 : 确定*/
    confirmString?: string,
    /**@description 取消按钮文字 默认为 : 取消*/
    cancelString?: string,
    /**@description 确定按钮回调 有回调则显示按钮，无回调则不显示*/
    confirmCb?: (isOK: boolean) => void,
    /**@description 取消按钮回调 有回调则显示按钮，无回调则不显示*/
    cancelCb?: (isOK: boolean) => void,
    /**@description 富文件显示内容 跟text只能二选1 */
    richText?: string,
    /**@description true 回调后在关闭弹出 false 关闭弹出框在回调 默认为 : false */
    immediatelyCallback?: boolean,
    /**@description 是否允许该tag的弹出框重复弹出，默认为true 会弹出同类型的多个 */
    isRepeat?: boolean,
    /**@description 用户自定义数据 */
    userData?: any,
}

/**
 * @description 数据代理
 * 如果是公共总合，name使用 td.COMMON_LANGUAGE_NAME
 */
declare interface LanguageDataSourceDelegate {
    name: string;
    data(language: string): LanguageData;
}

declare interface LanguageData {
    language: string;
}

declare function getSingleton<T>(cls: Singleton<T>): T

declare function dispatch(name: string, data?: any);

declare function require(any);

declare const Manager: FrameworkManager