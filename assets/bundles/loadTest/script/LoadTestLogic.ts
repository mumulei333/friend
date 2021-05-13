import { Logic } from "../../../script/common/base/Logic";
import { LogicType, LogicEvent, LogicEventData } from "../../../script/common/event/LogicEvent";
import { Manager } from "../../../script/common/manager/Manager";
import { ResourceLoaderError } from "../../../script/framework/assetManager/ResourceLoader";
import { ResourceData } from "../../../script/framework/base/Defines";
import LoadTestView from "./view/LoadTestView";

class LoadTestLogic extends Logic {

    logicType: LogicType = LogicType.GAME;

    onLoad() {
        super.onLoad();
    }

    protected bindingEvents() {
        super.bindingEvents();
        this.registerEvent(LogicEvent.ENTER_GAME, this.onEnterGame);
    }

    protected get bundle() {
        return "loadTest";
    }

    private onEnterGame(data) {
        if (data == this.bundle) {
            //游戏数据初始化
            //子游戏语言包初始化
            this.onLanguageChange();
            //加载资源
            this._loader.loadResources();
        }else{
           
            //卸载资源
            this._loader.unLoadResources();
        }
    }

    /**@description 进入的模块只要不是自己的模块，需要把自己加载的资源卸载 */
    onEnterComplete(data: LogicEventData) {
        super.onEnterComplete(data);
        //关闭房间列表
        if ( data.type == this.logicType ){
            
        }
        else{
            //移除网络组件 
            //this.removeNetComponent();
            //卸载资源
            this._loader.unLoadResources();
        }
    }

    protected onLoadResourceComplete( err : ResourceLoaderError ){
        if ( err == ResourceLoaderError.LOADING ){
            return;
        }
        cc.log(`${this.bundle}资源加载完成!!!`);
        super.onLoadResourceComplete(err);
        Manager.uiManager.open({ type: LoadTestView ,bundle:this.bundle});
    }

    protected getLoadResources():ResourceData[]{
        return [];
        // return [{ dir: "texture/sheep" , bundle : this.bundle,type : cc.SpriteFrame}];
    }
}

Manager.logicManager.push(LoadTestLogic);