export class ENetEvent {
    /**@description 网络打开 */
    static ON_OPEN = "NetEvent_ON_OPEN"
    /**@description 网络关闭 */
    static ON_CLOSE = "NetEvent_ON_CLOSE"
    /**@description 网络错误 */
    static ON_ERROR = "NetEvent_ON_ERROR"
    /**@description 应用层主动调用网络层close */
    static ON_CUSTOM_CLOSE = "NetEvent_ON_CUSTOM_CLOSE"
}