import SettingView from "../../../../scripts/common/component/SettingView";
import { ViewZOrder } from "../../../../scripts/common/config/Config";
import { dispatchEnterComplete, Logic } from "../../../../scripts/framework/core/logic/Logic";
import UIView from "../../../../scripts/framework/core/ui/UIView";
import { Macro } from "../../../../scripts/framework/defines/Macros";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOneView extends UIView {

    public static getPrefabUrl(){
        return "prefabs/GameOneView";
    }

    private testNode : cc.Node = null;

    onLoad(){
        super.onLoad();
        let goback = cc.find("goBack",this.node);
        goback.on(cc.Node.EventType.TOUCH_END,()=>{
            dispatch(Logic.Event.ENTER_HALL);
        });
        goback.zIndex = 10;

        this.audioHelper.playMusic("audio/background",this.bundle);

        cc.find("setting",this.node).on(cc.Node.EventType.TOUCH_END,this.onSetting,this);

        dispatchEnterComplete({type:Logic.Type.GAME,views:[this]});
    }

    private onSetting(){
        Manager.uiManager.open({
            type:SettingView,
            bundle:Macro.BUNDLE_RESOURCES,
            zIndex:ViewZOrder.UI,
            name:"设置界面"
        })
    }
}
