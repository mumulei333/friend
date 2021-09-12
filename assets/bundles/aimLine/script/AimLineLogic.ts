import { Entry } from "../../../scripts/framework/core/entry/Entry";
import { AimLineData } from "./data/AimLineData";
import AimLineView from "./view/AimLineView";

class AimLineLogic extends Entry {
    static bundle = AimLineData.bundle;
    protected addNetComponent(): void {
    }
    protected removeNetComponent(): void {
    }
    protected loadResources(completeCb: () => void): void {
        completeCb();
    }
    protected openGameView(): void {
        Manager.uiManager.open({ type: AimLineView, bundle: this.bundle });
    }
    protected initData(): void {
    }
    protected pauseMessageQueue(): void {
    }
    protected resumeMessageQueue(): void {
    }
}

Manager.entryManager.register(AimLineLogic);