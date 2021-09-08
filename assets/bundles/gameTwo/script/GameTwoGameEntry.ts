import { ClassName, RegisterEntry } from "../../../script/Framework/Decorator/Decorator";
import { GameEntry } from "../../../script/Framework/Support/Entry/GameEntry";
import { GameTwoModuleConfig } from "./Config/GameTwoModuleConfig";
import { GameTwoEvents } from "./Events/GameTwoEvents";

@ClassName()
@RegisterEntry("gameTwo")
export class GameTwoGameEntry extends GameEntry {
    protected initEntry() {
        super.initEntry();
        // this.addModule(GameTwoModuleConfig)
    }

    protected initViews() {
        manager.eventManager.dispatchEventWith(GameTwoEvents.OPEN_GAMETWO_MODULE)
    }

    protected closeViews() {
        // this.closeModule(GameTwoModuleConfig.GameTwoModule)
    }
}