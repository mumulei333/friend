import { Prefab } from "cc";
import { Resource } from "../../../scripts/framework/core/asset/Resource";
import { Entry } from "../../../scripts/framework/core/entry/Entry";
import { EliminateData } from "./data/EliminateData";
import { CELL_PREFAB_URL, EFFECTS_CONFIG } from "./data/EliminateDefines";
import EliminateGameView from "./view/EliminateGameView";

class EliminateEntry extends Entry {
    static bundle = EliminateData.bundle;
    protected addNetComponent(): void {
    }
    protected removeNetComponent(): void {
    }
    protected loadResources(completeCb: () => void): void {
        Manager.loading.show(Manager.getLanguage("loading_game_resources"));
        this.loader.getLoadResources = () => {
            let res: Resource.Data[] = [];
            for (let i = 0; i < CELL_PREFAB_URL.length; i++) {
                if (CELL_PREFAB_URL[i]) {
                    res.push({ url: CELL_PREFAB_URL[i] as string, type: Prefab, bundle: this.bundle })
                }
            }

            res.push({ url: EFFECTS_CONFIG.crush.url, type: Prefab, bundle: this.bundle });
            res.push({ url: EFFECTS_CONFIG.colBomb.url, type: Prefab, bundle: this.bundle });
            return res;
        };
        this.loader.onLoadComplete = (err)=>{
            if ( err = Resource.LoaderError.SUCCESS){
                Manager.loading.hide();
                completeCb();
            }
        };
        this.loader.loadResources();
    }
    protected openGameView(): void {
        Manager.uiManager.open({ type: EliminateGameView, bundle: this.bundle });
    }
    protected closeGameView(): void {
        Manager.uiManager.close(EliminateGameView);
    }
    protected initData(): void {
    }
    protected pauseMessageQueue(): void {
    }
    protected resumeMessageQueue(): void {
    }
}

Manager.entryManager.register(EliminateEntry);