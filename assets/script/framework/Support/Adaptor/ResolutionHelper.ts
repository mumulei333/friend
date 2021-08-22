import { EventApi } from "../Event/EventApi";

export class ResolutionHelper {
    private _logTag = "[ResolutionHelper]";
    private static _instance: ResolutionHelper = null;
    public static Instance() { return this._instance || (this._instance = new ResolutionHelper()); }
    private canvas: cc.Canvas = null;
    /**@description 是否需要进行全屏幕适配 */
    private screenAdaptType: ScreenAdaptType = ScreenAdaptType.None;
    private node: cc.Node = null;

    /**最大允许屏幕比率 */
    private readonly MAX_RATE = 2.4;

    private designResolution: cc.Size = null;
    private landscapeHeight = 0;
    private protraitHeight = 0;
    private waitScorllY = null;
    private isFirstResize = true;
    private _isShowKeyboard = false;
    private _maxLandscapeHeight = 0;
    public get isShowKeyboard() {
        return this._isShowKeyboard;
    }
    public set isShowKeyboard(value) {
        //let content = value ? "键盘显示!!!" : "键盘隐藏!!!";
        //cc.log(this._logTag,`${content}`);
        this._isShowKeyboard = value;

        if (!value) {
            this._onResize(true);
        }
    }

    /**@description 全屏适配 */
    public fullScreenAdapt(node: cc.Node, adapter?: IFullScreenAdapt) {
        if (node && this.isNeedAdapt) {
            //这里，做下优化，只有该节点有选配组件，才适配到全屏
            let widget = node.getComponent(cc.Widget);
            if (!widget) return;
            node.setContentSize(cc.winSize);
            //这里可能父节点还没有，就不管了，按当前节点大小，把子节点做布局
            this.updateAlignment(node);
            if (adapter) {
                adapter.onFullScreenAdapt();
            }
        }
    }

    /**@description 是否需要做适配操作，当分辨率发生变化，只要ScreenAdaptType 不是None的情况 */
    public get isNeedAdapt() {
        if (this.screenAdaptType != ScreenAdaptType.None) {
            return true;
        }
        return false;
    }

    private updateAlignment(node: cc.Node) {
        let ch = node.children;
        for (let i = 0; i < ch.length; i++) {
            let child = ch[i];
            cc.updateAlignment(child);
            this.updateAlignment(child);
        }
    }



    public onLoad(node: cc.Node) {
        this.node = node;
        this.canvas = node.getComponent(cc.Canvas);
        this.designResolution = this.canvas.designResolution.clone();
        this.onResize();
    }

    public onDestroy() {
        this.node = null;
        this.isFirstResize = false;
    }

    /**@description 做屏幕适配 */
    private doChangeResolution() {
        if (this.screenAdaptType == ScreenAdaptType.Increase) {
            let winsize = this.getWinsize();
            this.canvas.designResolution = winsize;
        } else if (this.screenAdaptType == ScreenAdaptType.Max) {
            let winsize = this.getMaxWinsize();
            if (CC_DEBUG) cc.log(`max winsize : ${winsize.width} * ${winsize.height}`);
            this.canvas.designResolution = winsize;
        } else {
            this.canvas.designResolution = this.designResolution;
        }
        if (this.isNeedAdapt) {
            dispatch(EventApi.AdaptScreenEvent);
            Manager.uiManager.fullScreenAdapt();
        }
    }


    /**@description 浏览器适配初始化 */
    public initBrowserAdaptor() {
        if (this.isBrowser && !CC_EDITOR) {
            cc.view.resizeWithBrowserSize(true);

            //调试浏览器
            if (CC_PREVIEW || cc.sys.platform == cc.sys.WECHAT_GAME) {
                this.recordHeight();
            } else {
                window.addEventListener("load", () => {
                    this.recordHeight();
                    window.addEventListener("resize", this.onResize, false);
                    window.addEventListener("orientationchange", this.onOrientationChange, false);
                }, false);
            }
        }
    }

    public get isBrowser() {
        if (cc.sys.isBrowser) {
            return true;
        }
        return false;
    }

    private get isSafari() {
        if (this.isBrowser && cc.sys.OS_IOS == cc.sys.os && cc.sys.browserType == cc.sys.BROWSER_TYPE_SAFARI) {
            return true;
        }
        return false;
    }

    private onOrientationChange() {
        this.recordHeight();
        this.isFirstResize = false;
        //cc.log(this._logTag,`onOrientationChange`);
    }

    private onResize() {
        this._onResize(false);
    }

    private _onResize(isHideKeyboard: boolean) {
        //cc.log(this._logTag,`onResize`);
        if (this.node) {
            if (CC_PREVIEW || cc.sys.platform == cc.sys.WECHAT_GAME) {
                this.recordHeight();
                this.doAdapt();
            }
            else {

                if (this.isShowKeyboard) {
                    //cc.log(`键盘显示，不做重新适配处理`);
                    this.recordHeight();
                    return;
                }

                if (this.dviceDirection == "Landscape") {
                    let height = this.landscapeHeight;
                    let offsetY = 0;
                    this.recordHeight();
                    if (this.landscapeHeight != 0) {
                        offsetY = this.landscapeHeight - height;//Math.abs(this.landscapeHeight - height);
                        if (this.isFirstResize) {
                            if (CC_DEBUG) cc.log(this._logTag, `在有导行条情况下进行刷新操作`);
                            this.waitScorllY = offsetY;
                            this.doAdapt();
                            this.isFirstResize = false;
                            return;
                        }
                    }
                }

                if (isHideKeyboard && this.dviceDirection == "Landscape") {
                    //cc.log(`maxHeigth : ${this._maxLandscapeHeight} curHeigth : ${this.landscapeHeight}`);
                    this.waitScorllY = Math.abs(this._maxLandscapeHeight - this.landscapeHeight);
                }

                this.isFirstResize = false;
                this.doAdapt();

                setTimeout(() => {
                    if (this.isShowKeyboard) {
                        //cc.log(`键盘显示11，不做重新适配处理`);
                        return;
                    }
                    if (this.dviceDirection == "Landscape") {
                        this.recordHeight();
                        cc.log(`cur scrolly : ${window.scrollY}`);
                        if (window.scrollY > 0 || this.isSafari) {
                            if (CC_DEBUG) cc.log(this._logTag, this.dviceDirection);
                            if (this.isSafari) {
                                //在safari浏览器下，做一个强制移动，让浏览器的导行条显示出来,不然在ios13之前，最顶部分按钮无法点击
                                this.waitScorllY = window.scrollY > 0 ? -window.scrollY : -50;
                            } else {
                                this.waitScorllY = -window.scrollY;
                            }
                            if (CC_DEBUG) cc.log(this._logTag, `scrollY : ${this.waitScorllY}`);
                            this.doAdapt();
                        } else {
                            this.doAdapt();
                        }
                    } else if (this.dviceDirection == "Portrait") {
                        if (this.protraitHeight > window.innerHeight) {
                            this.waitScorllY = (this.protraitHeight - window.innerHeight);
                        }
                        this.recordHeight();
                        this.doAdapt();
                    }
                }, 505);
            }
        }
    }

    private doAdapt() {
        if (this.canvas) {
            if (this.waitScorllY != null) {
                let top = this.waitScorllY;
                if (CC_DEBUG) cc.log(this._logTag, `scroll top : ${top}`);
                if (window.scrollTo) {
                    window.scrollTo(0, top);
                }
                this.waitScorllY = null;
            }
            this.calculateNeedFullScreenAdapt();
            this.doChangeResolution();
        }
        else {
            if (CC_DEBUG) cc.log(this._logTag, `等待场景加载完成做适配`);
        }
    }

    //记录屏幕高度
    private recordHeight() {
        if (window.innerWidth && window.innerHeight) {
            if (this.dviceDirection == "Landscape") {
                this.landscapeHeight = window.innerHeight;
                this._maxLandscapeHeight = Math.max(this._maxLandscapeHeight, this.landscapeHeight);
            } else if (this.dviceDirection == "Portrait") {
                this.protraitHeight = Math.max(window.innerWidth, window.innerHeight);

            }
        }
    }

    private getWinsize() {
        let frameSize = this.getFrameSize();
        let width = frameSize.width * this.designResolution.height / frameSize.height;
        let height = this.designResolution.height;
        return cc.size(width, height);
    }

    /**@description 最大化窗口大小 */
    private getMaxWinsize() {
        //实际当前窗口的宽度
        let height = this.designResolution.height;
        let width = height * this.MAX_RATE;
        return cc.size(width, height);
    }

    private getFrameSize() {
        let frameSize = cc.view.getFrameSize();
        let innerSize = this.windowInnerSize;
        let size = frameSize.clone();
        if (!CC_JSB && !CC_PREVIEW) {
            size = innerSize;
        }
        return size;
    }

    /**计算是否需要进行全屏幕适配 */
    private calculateNeedFullScreenAdapt() {
        //当前设计分辨率的宽高比
        let design = this.designResolution.width / this.designResolution.height;
        let frameSize = this.getFrameSize();
        let rate = frameSize.width / frameSize.height;
        if (this.dviceDirection == "Portrait" || (this.dviceDirection == '' && design < 1)) {
            design = 1 / design;
            rate = 1 / rate;
        }
        if (CC_DEBUG) cc.log(this._logTag, `design : ${design} real : ${rate}`);

        this.screenAdaptType = ScreenAdaptType.None;
        if (design == rate) {
            //相等比率，
            if (CC_DEBUG) cc.log(this._logTag, `相等比率`);
        } else if (rate < design) {
            this.screenAdaptType = ScreenAdaptType.Decrease;
            if (CC_DEBUG) cc.log(this._logTag, `当前设计比率大于实际比率，按宽进行适配，上下有黑边`);
        } else {
            if (CC_DEBUG) cc.log(this._logTag, `当前设计比率小于实际比率，将会对支持全屏的界面进行重重布局`);
            if (rate >= this.MAX_RATE) {
                if (CC_DEBUG) cc.log(this._logTag, `超过上限比率，按最大值来`)
                this.screenAdaptType = ScreenAdaptType.Max;
            } else {
                this.screenAdaptType = ScreenAdaptType.Increase;
            }
        }
    }

    /**@description 当前是否处于横屏状态 */
    private get dviceDirection(): DeviceDirection {
        if ((window.orientation != undefined || window.orientation != null) && (window.orientation == 90 || window.orientation == -90)) {
            return "Landscape";
        }
        if ((window.orientation != undefined || window.orientation != null) && (window.orientation == 0 || window.orientation == 180)) {
            return "Portrait";
        }
        return "";
    }

    private get windowInnerSize() {
        let size = cc.Size.ZERO.clone();
        if (window.innerHeight && window.innerWidth) {
            let w = window.innerWidth;
            let h = window.innerHeight;
            let isLandscape = w >= h;
            if (!cc.sys.isMobile || isLandscape) {
                size.width = w;
                size.height = h;
            } else {
                size.width = h;
                size.height = w;
            }
        }
        return size;
    }
}
// td.ResolutionHelper = ResolutionHelper

type DeviceDirection = "" | "Landscape" | "Portrait";

enum ScreenAdaptType {
    /**@description 无处理 */
    None,
    /**@description 放大 */
    Increase,
    /**@description 缩小 */
    Decrease,
    /**@description 最大化，不能在进行拉伸扩大了 */
    Max,
}
