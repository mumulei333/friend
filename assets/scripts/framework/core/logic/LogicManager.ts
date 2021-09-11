import { Logic } from "./Logic";
import { LogicImpl } from "./LogicImpl";

/**
 * @description 逻辑控制器管理器 
 * 管理所有继承自Logic的子类
 * 如，坦克大战的TankBattleLogic
 * 收到LogicEvent.ENTER_COMPLETE 时，会自动关闭掉除传入的views之外的所有继续息UIView的界面
 */
export class LogicManager{
    
    private _logTag = `[LogicManager]`;
    private static _instance: LogicManager = null!;
    public static Instance() { return this._instance || (this._instance = new LogicManager()); }

    private _logics : LogicImpl[] = [];
    private _logicTypes : LogicClass<LogicImpl>[] = [];
    private node : cc.Node = null;

    public push( logicType : LogicClass<LogicImpl> ){
        for ( let i = 0 ; i < this._logicTypes.length ; i++ ){
            if ( this._logicTypes[i] == logicType ){
                cc.error(this._logTag, `重复添加${cc.js.getClassName(logicType)}`);
                return;
            }
        }
        if ( this.node ){
            //已经进入过onLoad,这里需要单独的进行初始化
            let logic = new logicType;
            logic.init(this.node);
            this._logics.push(logic);
            logic.onLoad();
        }else{
            this._logicTypes.push(logicType);
        }
    }

    public onLoad( node : cc.Node ){
        this.node = node;
        Manager.eventDispatcher.addEventListener(Logic.Event.ENTER_COMPLETE,this.onEnterComplete,this);
        if ( this._logics.length == 0 ){
            for ( let i = 0 ; i < this._logicTypes.length ; i++ ){
                let type = this._logicTypes[i];
                cc.log(this._logTag,`添加Logic : ${cc.js.getClassName(type)}`);
                let logic : LogicImpl = new type;
                logic.init(node);
                this._logics.push( logic );
            }
        }

        this._logics.forEach((data)=>{
            data.onLoad();
        });
        
    }

    public onDestroy( node : cc.Node ){
        Manager.eventDispatcher.removeEventListener(Logic.Event.ENTER_COMPLETE,this);
        this._logics.forEach((data)=>{
            data.onDestroy();
        });
    }

    protected onEnterComplete(data: Logic.EventData) {

        //房间列表会直接加在大厅上，不对界面进行关闭操作
        if ( data.type != Logic.Type.ROOM_LIST ){
            if (data && data.views && data.views.length > 0) {
                //关闭掉除排除项之外的所有界面
                Manager.uiManager.closeExcept(data.views);
            }
            for ( let i = 0 ; i < this._logics.length ; i++ ){
                let logic = this._logics[i];
                if ( logic ){
                    logic.onEnterComplete(data);
                }
            }
            if( data.type == Logic.Type.HALL){
                //删除加载的子游戏bundle
                Manager.bundleManager.removeLoadedGamesBundle();
            }else if( data.type == Logic.Type.LOGIN ){
                //返回到登录界面，删除所有加载的bundles，包括大厅hall
                Manager.bundleManager.removeLoadedBundle();
            }
        }
    }
}
