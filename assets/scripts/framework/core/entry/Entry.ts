import ResourceLoader from "../asset/ResourceLoader";

export abstract class Entry {

    static bundle = "";
    /**@description 是否是主包 */
    static isMain = false;
    /**@description 当前bundle名,由管理器指定 */
    bundle: string = "";
    /**@description 当前语言包数据源代码，可为null */
    protected language: Language.DataSourceDelegate | null = null;

    /**@description 模块资源加载器 */
    protected loader: ResourceLoader = null!;

    /**@description 当前MainController所在节点 */
    protected node: cc.Node = null!;

    /**@description 当胆入口是否已经运行中 */
    isRunning: boolean = false;

    constructor() {
        this.loader = new ResourceLoader();
    }

    /**@description init之后触发,由管理器统一调度 */
    onLoad(node: cc.Node): void {
        this.node = node;
        this.isRunning = true;
    }

    /**@description 场景销毁时触发,管理器统一调度 */
    onDestroy(): void {
        this.isRunning = false;
    }

    /**@description 管理器通知自己进入GameView */
    onEnter(): void {
        //语言包初始化
        if (this.language) {
            Manager.language.addSourceDelegate(this.language);
        }
        //初始化游戏数据
        this.initData();
        //添加网络事件
        this.addNetComponent();
        //暂停当前网络处理队列，等资源加载完成后打开界面
        this.pauseMessageQueue();
        //加载资源
        this.loadResources(() => {
            this.openGameView();
        });
    }

    /**@description 这个位置说明自己GameView 进入onLoad完成 */
    onEnterComplete(): void {

    }

    /**@description 卸载bundle,即在自己bundle删除之前最后的一条消息 */
    onUnloadBundle(): void {
        //自己bundle初始卸载前要关闭当前bundle的所有界面
        Manager.uiManager.closeBundleView(this.bundle);
        //移除本模块网络事件
        this.removeNetComponent();
        //卸载资源
        this.unloadResources();
    }

    /**@description 添加该模块网络事件 */
    protected abstract addNetComponent(): void;
    protected abstract removeNetComponent(): void;

    /**@description 加载模块资源 */
    protected abstract loadResources(completeCb: () => void): void;
    protected unloadResources(): void{
        this.loader.unLoadResources();
    }

    /**@description 打开游戏主场景视图 */
    protected abstract openGameView(): void;
    protected abstract closeGameView(): void;

    /**@description 初始化游戏数据 */
    protected abstract initData(): void;

    /**@description 暂停网络 */
    protected abstract pauseMessageQueue(): void;

    protected abstract resumeMessageQueue(): void;
}