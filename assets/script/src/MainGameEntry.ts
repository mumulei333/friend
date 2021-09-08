import { ClassName, RegisterEntry } from "../Framework/Decorator/Decorator";
import { GameEntry } from "../Framework/Support/Entry/GameEntry";
import { MainModuleConfig } from "./Configs/MainModuleConfig";

@ClassName()
@RegisterEntry()
export class MainGameEntry extends GameEntry {
    protected initEntry() {
        super.initEntry();
        let { BootModule, LoginModule } = MainModuleConfig
        this.addModule(BootModule, "", "excutHello")
        this.addModule(LoginModule, "", "excutHello")
        // this.addModule(MainModuleConfig
    }

    protected addEvents() {
        manager.eventManager.addEvent(this, "test", this._test)
    }

    protected _test() {
        this.excutModuleFunc("excutHello", "Hello", "你好啊", "我很好")
    }
}