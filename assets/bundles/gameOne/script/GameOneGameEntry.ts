import { decorator } from "../../../script/Framework/Decorator/Decorator";
import { GameEntry } from "../../../script/Framework/Support/Entry/GameEntry";
import { GameOneEvents } from "./Events/GameOneEvents";

const { className, registerEntry } = decorator

@className()
@registerEntry("gameOne")
export class GameOneGameEntry extends GameEntry {

    protected initEntry() {
        super.initEntry();
        // this.addModule(GameOneModuleConfig)
    }

    protected initViews() {
        dispatchEventWith(GameOneEvents.OPEN_GAMEONE_MODULE)
    }

    protected close() {
        super.close()
        this.closeViews()
    }
}