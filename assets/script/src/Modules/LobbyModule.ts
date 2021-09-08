import { ModuleComponent, ModuleHideOption, ModuleShowOption } from "../../Framework/Component/ModuleComponent"
import { GameItemBinder } from "../Binders/GameItemBinder"


const { ccclass } = cc._decorator
@ccclass
export default class LobbyModule extends ModuleComponent {
    static getPrefabUrl() { return "prefabs/LobbyModule" }
    show(option: ModuleShowOption): void {
        this.scheduleOnce(() => {
            option.onShowed()
        }, 1)
    }
    hide(option: ModuleHideOption) { option.onHided() }


    onLoad() {
        this.initGameList()
    }

    private initGameList() {
        let subGameNode = this.find("gameItem")
        let gameList = this.find("gamelist")
        let list = manager.versionManager.getSubPkgList()
        let val: IteratorResult<string> = list.next()
        while (val = list.next(), !val.done) {
            let node = cc.instantiate(subGameNode)
            let binder = new GameItemBinder()
            let param = manager.versionManager.getRemoteInfo(val.value)
            node.name = param.name
            gameList.addChild(node)
            binder.setNode(node, param)
            this.addBinder(binder)
        }
    }

}

// //这个地方可以做成web获取
// const gamelist = [
//     { name: "游戏1", bundleName: "gameOne", entryName: "GameOneGameEntry", manifestRoot: "" },
//     { name: "游戏2", bundleName: "gameTwo", entryName: "GameTwoGameEntry" },
//     { name: "坦克大战", bundleName: "tankBattle", entryName: "" },
//     { name: "扩展Load接口示例", bundleName: "loadTest", entryName: "" },
//     { name: "网络示例", bundleName: "netTest", entryName: "" },
//     { name: "瞄准线", bundleName: "aimLine", entryName: "" },
//     { name: "节点对象池", bundleName: "nodePoolTest", entryName: "" },
//     { name: "Shader", bundleName: "shaders", entryName: "" },
//     { name: "三消", bundleName: "eliminate", entryName: "" },
// ]