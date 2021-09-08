import { ClassName, RegisterEntry } from "../../../script/Framework/Decorator/Decorator";
import { GameEntry } from "../../../script/Framework/Support/Entry/GameEntry";
import { GameOneEvents } from "./Events/GameOneEvents";

@ClassName()
@RegisterEntry("gameOne")
export class GameOneGameEntry extends GameEntry {

    protected initEntry() {
        super.initEntry();
        // this.addModule(GameOneModuleConfig)
    }

    protected initViews() {
        manager.eventManager.dispatchEventWith(GameOneEvents.OPEN_GAMEONE_MODULE)
    }

    protected closeViews() {
    }
}