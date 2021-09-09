import { LayerEnum } from "../../../../script/Framework/Defineds/Enums/LayerEnum";
import { IModuleConfig } from "../../../../script/Framework/Defineds/Interfaces/IModuleConfig";
import { GameOneEvents } from "../Events/GameOneEvents";
import GameOneModule from "../Modules/GameOneModule";

export const GameOneModuleConfig: {
    "GameOneModule": IModuleConfig
} = {
    GameOneModule: {
        component: GameOneModule,
        moduleName: GameOneEvents.OPEN_GAMEONE_MODULE,
        layer: LayerEnum.GameLayer.Content,
        zIndex: 0,
        name: "GameOneModule",
    },
}