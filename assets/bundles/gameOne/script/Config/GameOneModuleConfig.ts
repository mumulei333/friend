import { Layer } from "../../../../script/Framework/Defineds/Enums/Layer";
import { IModuleConfig } from "../../../../script/Framework/Defineds/Interfaces/IModuleConfig";
import { GameOneEvents } from "../Events/GameOneEvents";
import GameOneModule from "../Modules/GameOneModule";

export const GameOneModuleConfig: {
    "GameOneModule": IModuleConfig
} = {
    GameOneModule: {
        component: GameOneModule,
        moduleName: GameOneEvents.OPEN_GAMEONE_MODULE,
        layer: Layer.GameLayer.Content,
        zIndex: 0,
        name: "GameOneModule",
    },
}