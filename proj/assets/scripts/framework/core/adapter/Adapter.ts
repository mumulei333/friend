
/**
 * @description 该适配方案出处 https://forum.cocos.org/t/cocos-creator/74001
 */

/**
 * 屏幕分辨率下 的像素值
 */
export interface SafeArea {
    /**
     * 屏幕分辨率下：画布（屏幕)宽度
     */
    width: number;

    /**
     * 屏幕分辨率下：画布（屏幕）高度
     */
    height: number;

    /**
     * 屏幕分辨率下：安全区域宽度像素
     */
    safeAreaWidth: number;

    /**
     * 屏幕分辨率下：安全区域高度像素
     */
    safeAreaHeight: number;

    /**
     * 屏幕分辨率下：安全区域距离画布（屏幕）上边缘的距离像素
     */
    top: number;

    /**
     * 屏幕分辨率下：安全区域距离画布（屏幕）下边缘的距离像素
     */
    bottom: number;

    /**
     * 屏幕分辨率下：安全区域距离画布（屏幕）左边缘的距离像素
     */
    left: number;

    /**
     * 屏幕分辨率下：安全区域距离画布（屏幕）右边缘的距离像素
     */
    right: number;

    /**
     * 屏幕分辨率下：安全区域 X 偏移像素（相对于 Cocos 坐标系，X轴正方向往右，Y轴正方向往上）
     */
    offsetX: number;

    /**
     * 屏幕分辨率下：安全区域 Y 偏移像素（相对于 Cocos 坐标系，X轴正方向往右，Y轴正方向往上）
     */
    offsetY: number;

    /**
     * 「设计分辨率」像素值转换到 「屏幕分辨率」 下的像素比
     *
     * e.g.
     *
     * * screenPx = designPx * pixelRatio
     * * designPx = screenPx / pixelRatio
     */
    designPxToScreenPxRatio: number;
}

/**@description 设备方向 */
enum DeviceDirection{
    /**@description 未知*/
    Unknown,
    /**@description 横屏(即摄像头向左) */
    LandscapeLeft,
    /**@description 横屏(即摄像头向右) */
    LandscapeRight,
    /**@description 竖屏(即摄像头向上) */
    Portrait,
    /**@description 竖屏(即摄像头向下) */
    UpsideDown,
}

const EDITOR_SIZI = cc.size(1280, 720);
export class Adapter extends cc.Component {

    static direction = DeviceDirection;

    protected set width(value: number) {
        this.node.width = value;
    }
    protected get width() {
        return this.node.width;
    }

    protected set height(value: number) {
        this.node.height = value;
    }

    protected get height() {
        return this.node.height;
    }

    protected static get canvasSize() {
        if (CC_EDITOR) {
            return EDITOR_SIZI;
        } else {
            return cc.view.getCanvasSize();
        }
    }

    protected static get visibleSize() {
        if (CC_EDITOR) {
            return EDITOR_SIZI;
        } else {
            return cc.view.getVisibleSize();
        }
    }

    protected _func: any = null;

    onLoad() {
        super.onLoad && super.onLoad();
        this.onChangeSize();
    }

    onEnable() {
        super.onEnable && super.onEnable();
        this.addEvents();
    }

    onDisable() {
        this.removeEvents();
        super.onDisable && super.onDisable();
    }

    onDestroy() {
        this.removeEvents();
        super.onDestroy && super.onDestroy();
    }

    protected addEvents() {
        if (this._func) {
            return;
        }
        this._func = this.onChangeSize.bind(this);
        window.addEventListener("resize", this._func);
        window.addEventListener("orientationchange", this._func);
    }

    protected removeEvents() {
        if (this._func) {
            window.removeEventListener("resize", this._func);
            window.removeEventListener("orientationchange", this._func);
        }
        this._func = null;
    }

    /**
     * @description 视图发生大小变化
     */
    protected onChangeSize() {
        
    }

    /**@description 获取当前设备方向 */
    get direction(){
        let str = "未知"
        let result = DeviceDirection.Unknown;
        if ( window.orientation ){
            if ( window.orientation == 90 ){
                str = `横屏向左`
                result = DeviceDirection.LandscapeLeft;
            }else if ( window.orientation == -90 ){
                str = `横屏向右`
                result = DeviceDirection.LandscapeLeft;
            }else if ( window.orientation == 0 ){
                str = "竖屏向上"
                result = DeviceDirection.Portrait;
            }else if ( window.orientation == 180 ){
                str = "竖屏向下"
                result = DeviceDirection.UpsideDown;
            }
        }
        Log.d(`设备方向 : ${str}`)
        return result;
    }
}
