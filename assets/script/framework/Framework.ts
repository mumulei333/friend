import { ServiceManager } from "../Common/Manager/ServiceManager"
import { LanguageConfig } from "./Config/Config"
import { ResolutionHelper } from "./Support/Adaptor/ResolutionHelper"
import { AssetManager } from "./Support/AssetManager/AssetManager"
import { CacheManager } from "./Support/AssetManager/CacheManager"
import { Resource } from "./Support/AssetManager/Interfaces"
import { EventDispatcher } from "./Support/Event/EventDispatcher"
import { Language } from "./Support/Language/Language"
import { NodePoolManager } from "./Support/NodePool/NodePool"
import { LocalStorage } from "./Support/Storage/LocalStorage"
import { UIManager } from "./Support/UI/UIManager"

export class Framework {
    /**@description 事件派发器 */
    get eventDispatcher() { return getSingleton(EventDispatcher) }

    /**@description 本地数据存储 */
    get localStorage() { return getSingleton(LocalStorage) }

    /**@description 资源管理 */
    get assetManager() { return getSingleton(AssetManager) }

    /**@description 资源缓存管理 */
    get cacheManager() { return getSingleton(CacheManager) }

    /**@description 屏幕适配 */
    get resolutionHelper() { return getSingleton(ResolutionHelper) }

    /**@description 对象池管理器 */
    get nodePoolManager() { return getSingleton(NodePoolManager) }

    get uiManager() { return getSingleton(UIManager) }

    get serviceManager() { return getSingleton(ServiceManager) }

    /**@description 语言包 */
    get language() { return getSingleton(Language) }


    /**
     * @description 获取语言包 
     * 
     */
    getLanguage(param: string | (string | number)[], bundle: Resource.BUNDLE_TYPE = null): string {
        let key = "";
        if (typeof param == "string") {
            if (bundle) {
                key = `${LanguageConfig.USING_LAN_KEY}${bundle}.${param}`;
            } else {
                key = `${LanguageConfig.USING_LAN_KEY}${param}`;
            }
            return this.language.get([key]);
        }
        if (typeof param[0] == "string" && param instanceof Array) {
            if (bundle) {
                param[0] = `${LanguageConfig.USING_LAN_KEY}${bundle}.${param[0]}`;
            } else {
                param[0] = `${LanguageConfig.USING_LAN_KEY}${param[0]}`;
            }
            return this.language.get(param);
        }
        cc.error(`传入参数有误`);
        return "";
    }

}