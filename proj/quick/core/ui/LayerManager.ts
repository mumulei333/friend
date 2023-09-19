import { Component, Node, find, instantiate, js } from "cc";
import { DEBUG } from "cc/env";
/**
 * @description 层级管理器
 */

export default class LayerManager implements ISingleton {
    static module = "【层级管理器】"
    isResident = true;
    module: string = null!;

    /**@description 层级配置 */
    private _cfgs: LayerConfig[] = [];

    /**@description  */
    private _layers: Map<number, Node> = new Map();

    private node: Node = null!;

    /**@description 根节点 */
    private _root: Node = null!;

    /**@description 获取根节点 */
    get root() {
        if (!this._root) {
            this._root = find("viewRoot", this.node)!;
        }
        return this._root;
    }

    add(node: Node, zOrder: number) {
        let layer = this._layers.get(zOrder);
        if (layer) {
            layer.addChild(node);
        } else {
            Log.e(`${this.module}未定义的层级`);
        }
    }

    onLoad(node: Node) {
        this.node = node;
        let templete = instantiate(this.root);
        //根据当前配置，初始化
        this._cfgs.forEach(v => {
            let node = instantiate(templete);
            this.root.addChild(node);
            node.name = `Layer_${v.name}`;
            node.userData = v.name;
            this._layers.set(v.sort, node);
        })
    }

    /**
     * @description 走到这里面，说明游戏结束，或都重启游戏，直接清空,避免double free
     * @param node 
     */
    onDestroy(node: Node) {

    }

    public addComponent<T extends Component>(type: { new(): T }): T;
    public addComponent(className: string): any;
    public addComponent(data: any) {
        if (this.root) {
            let component = this.root.getComponent(data);
            if (component) {
                if (typeof data == "string") {
                    if (DEBUG) Log.w(`${this.module}已经存在 Component ${component}`)
                }
                else {
                    if (DEBUG) Log.w(`${this.module}已经存在 Component ${js.getClassName(data)}`);
                }
                return component;
            }
            else {
                return this.root.addComponent(data);
            }
        }
        return null;
    }

    public removeComponent(component: string | Component) {
        if (this.root) {
            let comp = this.root.getComponent(component as any);
            if (comp) {
                comp.destroy();
            }
        }
    }

    init(zOrderCfgs: any) {
        let keys = Object.keys(zOrderCfgs);
        keys.forEach(v => {
            let cfg: LayerConfig = { name: v, sort: zOrderCfgs[v] };
            this._cfgs.push(cfg);
        });
        this._cfgs.sort((a, b) => {
            return a.sort - b.sort;
        })
        // Log.d(JSON.stringify(this._cfgs));
    }
    destory?(...args: any[]) {

    }
    clear?(...args: any[]) {

    }

    debug(config: { showChildren?: boolean, showComp?: boolean }): void {
        if ( !config ){
            config = {};
            config.showChildren = true;
            config.showComp = true;
        }
        if (this.root) {
            if (config.showChildren) {
                Log.d(`${this.module} 层级信息,注：该层级上无任何节点的不输出信息。`)
                this._layers.forEach(v => {
                    if (v.children.length > 0) {
                        Log.d(`${v.userData} 层包含节点如下:`);
                        v.children.forEach(c => {
                            Log.d(`${c.name} active : ${c.active}`)
                        })
                    }
                })
            }
            if (config.showComp) {
                Log.d(`${this.module} 组件信息`);
                let comps: any[] = (<any>this.root)._components;
                for (let i = 0; i < comps.length; i++) {
                    Log.d(js.getClassName(comps[i]));
                }
            }
        }
    }
}
