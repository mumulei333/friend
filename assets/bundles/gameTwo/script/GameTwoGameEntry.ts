import { decorator } from "../../../script/Framework/Decorator/Decorator";
import { GameEntry } from "../../../script/Framework/Support/Entry/GameEntry";
import { GameTwoEvents } from "./Events/GameTwoEvents";

const { className, registerEntry } = decorator

@className()
@registerEntry("gameTwo")
export class GameTwoGameEntry extends GameEntry {
    protected initEntry() {
        super.initEntry();
        // this.addModule(GameTwoModuleConfig)
    }

    protected initViews() {
        dispatchEventWith(GameTwoEvents.OPEN_GAMETWO_MODULE)
    }

    protected close() {
        // this.closeModule(GameTwoModuleConfig.GameTwoModule)
    }
}