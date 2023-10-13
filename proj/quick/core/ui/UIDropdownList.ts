import { _decorator, BlockInputEvents, Component, director, easing, EventHandler, instantiate, isValid, Layers, Layout, Node, Prefab, Scene, ScrollView, Size, Sprite, SpriteFrame, Toggle, ToggleContainer, tween, UITransform, Vec3 } from 'cc';
import { DEBUG, DEV, EDITOR } from 'cc/env';
const { ccclass, property, menu } = _decorator;

enum Event {
    /**@description 选项事件变更 */
    SELECT_CHANGED
}

let temp = new Vec3();
let result = new Vec3();
/**
 * @description 下拉列表
 */
@ccclass('UIDropdownList')
@menu("QuickUI组件/UIDropdownList")
export class UIDropdownList extends Component {

    static Event = Event;

    @property({ tooltip: EDITOR ? "下拉列表滚动视图" : "", type: Node })
    view: Node = null!;

    @property({ tooltip: EDITOR ? "事件阻挡层，当弹出【下拉列表滚动视图】时，点击空白处，隐藏【下拉列表滚动视图】" : "", type: Node })
    block: Node = null!;

    @property({ tooltip: EDITOR ? "下拉列表标题" : "", type: Node })
    title: Node = null!;

    @property({ tooltip: EDITOR ? "下拉列表项节点模板" : "", type: Node })
    itemTemplate: Node = null!;

    /**@description 裂变项 */
    protected items: Node[] = [];

    /**@description 当前是否是折叠状态*/
    protected _isFold = true;

    /**@description 滚动视图中单选按钮组 */
    protected toggleContainer: ToggleContainer = null!;

    /**@description 更新裂变项数据 */
    updateHandler: (isTitle: boolean, node: Node, index: number) => void = null!;

    /**
     * @description 重新刷新
     * @param count 列表的总项数
     */
    reload<T>(datas: T[]) {
        if (!isValid(this.view)) {
            DEBUG && Log.e(`请先设置【下拉列表滚动视图】`);
            return;
        }
        if (!isValid(this.itemTemplate)) {
            DEBUG && Log.e(`请行设置列表项模板`);
        }
        if (!this.toggleContainer) {
            DEBUG && Log.e(`滚动视图中无toggleContainer`);
            return;
        }
        this.reset();
        datas.forEach((value, index) => {
            let node = instantiate(this.itemTemplate);
            node.userData = value;
            this.items.push(node);
            this.view.getComponent(ScrollView)!.content?.addChild(node);
            if (this.updateHandler) {
                this.updateHandler(false, node, index);
            }
        })
        this.title.userData = this.selected?.node.userData;
        this.updateHandler(true, this.title,0)
    }

    get selected() {
        if (this.toggleContainer) {
            for (let i = 0; i < this.toggleContainer.toggleItems.length; i++) {
                if (this.toggleContainer.toggleItems[i].isChecked) {
                    return this.toggleContainer.toggleItems[i];
                }
            }
        }
        return null;
    }

    /**
     * @description 获取当胶下拉的所有列表项
     */
    getList() {
        return this.items;
    }

    protected onLoad(): void {
        super.onLoad && super.onLoad();
        //绑定收起事件
        if (isValid(this.block)) {
            this.block.on(Node.EventType.TOUCH_END, this.fold, this);
        }
        //绑定标题事件
        if (isValid(this.title)) {
            this.title.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        }
        //绑定选中事件
        if (isValid(this.view)) {
            let scrollView = this.view.getComponent(ScrollView)!;
            if (!scrollView) {
                DEBUG && Log.e(`找不到滚动视图`);
                return;
            }
            this.toggleContainer = scrollView.content!.getComponent(ToggleContainer)!;
            if (!this.toggleContainer) {
                DEBUG && Log.e(`滚动视图的.content 找不到 ToggleContainer`);
                return;
            }

            let handler = new EventHandler;
            handler.component = "UIDropdownList";
            handler.handler = "onSelected";
            handler.target = this.node;
            this.toggleContainer?.checkEvents.push(handler);
        }
        this.reset();
    }

    protected onDestroy(): void {

        if (isValid(this.block)) {
            this.block.destroy();
        }
        if (isValid(this.itemTemplate)) {
            this.itemTemplate.destroy();
        }
        if (isValid(this.view)) {
            this.view.destroy();
        }
        super.onDestroy && super.onDestroy();
    }

    protected onDisable(): void {
        this.fold();
        super.onDisable && super.onDisable();
    }

    /**
     * @description 收起
     */
    protected fold() {
        DEBUG && Log.d("收起下拉列表");
        this._isFold = true;
        let block = this.block;
        if (isValid(block)) {
            block.removeFromParent();
        }
        if (isValid(this.view)) {
            if (this.view.parent) {
                tween(this.view).delay(0.05).to(0.1, {
                    scale: new Vec3(1, 0, 1)
                }).call(() => {
                    this.view.removeFromParent();
                })
                    .start();
            }
        }
    }

    /**
     * @description 展开
     */
    protected unfold() {
        DEBUG && Log.d("展开下拉列表");
        this._isFold = true;
        let root = App.layerMgr.root;
        let block = this.block;
        if (isValid(block)) {
            block.removeFromParent()
            block.setPosition(0, 0);
            block.active = true;
            root?.addChild(block);
        }

        if (isValid(this.view)) {
            let view = this.view;
            view.removeFromParent();
            let trans = this.title.getComponent(UITransform)!;
            this.title.getWorldPosition(temp);
            root?.addChild(view);
            App.layerMgr.root.getComponent(UITransform)!.convertToNodeSpaceAR(temp, result);
            result.x += (0.5 - trans.anchorX) * trans.width;
            result.y += (0 - trans.anchorY) * trans.height;
            this.view.getComponent(UITransform)!.setAnchorPoint(0.5, 1)
            this.view.setPosition(result);
            view.active = true;
            view.getComponent(ScrollView)?.scrollToTop();
            tween(this.view).to(0.1, {
                scale: new Vec3(1, 1, 1)
            }, {
                easing: easing.circOut
            }).call(() => {

            }).start();
        }
    }

    protected onTouchEnd() {
        if (this._isFold) {
            this.unfold();
        } else {
            this.fold();
        }
    }

    protected onSelected(toggle: Toggle) {
        this.fold();
        this.title.userData = toggle.node.userData;
        this.updateHandler(true,this.title,0);
    }

    protected reset() {
        if (isValid(this.block)) {
            this.block.removeFromParent();
        }
        if (isValid(this.itemTemplate)) {
            this.itemTemplate.removeFromParent();
        }
        if (isValid(this.view)) {
            this.view.setScale(1, 0, 1)
            this.view.removeFromParent();
        }
    }
}

