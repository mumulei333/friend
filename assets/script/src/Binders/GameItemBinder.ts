import { ISubPackageVersionOption } from "../../Common/Managers/PackageVersion/VersionManager";
import { ModuleBinder } from "../../Framework/Component/ModuleBinder";
import { BundleOption } from "../../Framework/Support/Bundler/BundleManager";

export class GameItemBinder extends ModuleBinder {

    private data: ISubPackageVersionOption = null
    public setNode(node: cc.Node, ...args: any[]) {
        this.data = args[0]
        super.setNode(node, ...args)
    }

    private _title: cc.Label = null
    private _process_sprite: cc.Node = null
    private _process_title: cc.Label = null

    protected initViews() {
        this.node.active = true
        this._title = this.find("title").getComponent(cc.Label)
        this._process_sprite = this.find("process")
        this._process_title = this.find("process_text").getComponent(cc.Label)
        this._process_sprite.active = false
        this._process_sprite.height = 204
        this._process_title.string = ""
        this._process_title.node.active = false
        this._title.string = this.data.gameName
        if (manager.isBrower) {
            this.node.on("click", this._joinSubGame, this)
        }
        //如果浏览器. 直接注册事件就好,
        //如果是Native, 检查一下子游戏是否下载.是否有更新在去注册事件.
    }


    //nativa环境下.检查子包是否有更新或者未下载
    private _checkStatus() {
        if (CC_JSB) {
            let content = ""
            let object: { version: string, packageUrl: string }
            if (jsb.fileUtils.isFileExist(this.data.name + "_version.manifest")) {
                content = jsb.fileUtils.getStringFromFile(this.data.bundle + "_version.manifest")
            }
            else if (jsb.fileUtils.isFileExist(this.data.name + "_project.manifest")) {
                content = jsb.fileUtils.getStringFromFile(this.data.name + "_project.manifest")
            }
            //未下载子游戏
            if (content == "") { }
            else {
                object = JSON.parse(content)
                //对比版本

            }
        }
    }

    private _joinSubGame() {
        manager.bundleManager.entryBundle(new BundleOption({
            name: this.data.name,
            bundleName: this.data.bundle,
            entryGame: this.data.entry
        }))
    }

    protected addEvents() { }
}