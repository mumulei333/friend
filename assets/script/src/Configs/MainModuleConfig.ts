import { IModuleConfig } from "../../Framework/Defineds/Interfaces/IModuleConfig";
import LobbyModule from "../Modules/LobbyModule";
import BootModule from "../Modules/BootModule";
import LoginModule from "../Modules/LoginModule";
import { LayerEnum } from "../../Framework/Defineds/Enums/LayerEnum";
import { MainEvents } from "../Events/MainEvents";


type types = ["BootModule", "LoginModule", "LobbyModule"]
export const MainModuleConfig: { [key in types[number]]: IModuleConfig } = {
    BootModule: {
        component: BootModule,
        layer: LayerEnum.GameLayer.Content,
        moduleName: MainEvents.BOOT_MODULE,
        zIndex: 0,
        name: "BootModule",
    },
    LoginModule: {
        component: LoginModule,
        layer: LayerEnum.GameLayer.Content,
        moduleName: MainEvents.LOGIN_MODULE,
        zIndex: 0,
        name: "LoginModule",
    },
    LobbyModule: {
        component: LobbyModule,
        layer: LayerEnum.GameLayer.Content,
        moduleName: MainEvents.LOBBY_MODULE,
        zIndex: 0,
        name: "LobbyModule",
    }
}