import { LayerEnum } from "../../../../script/Framework/Defineds/Enums/LayerEnum";
import { IModuleConfig } from "../../../../script/Framework/Defineds/Interfaces/IModuleConfig";
import { GameTwoEvents } from "../Events/GameTwoEvents";
import GameTwoModule from "../Modules/GameTwoModule";

type types = ["GameTwoModule"]
export const GameTwoModuleConfig: { [key in types[number]]: IModuleConfig } = {
    GameTwoModule: {
        component: GameTwoModule,
        moduleName: GameTwoEvents.OPEN_GAMETWO_MODULE,
        layer: LayerEnum.GameLayer.Content,
        zIndex: 0,
        name: "GameTwoModule",
    },
}