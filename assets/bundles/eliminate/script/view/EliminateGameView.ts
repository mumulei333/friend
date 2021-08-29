import GameView from "../../../../scripts/framework/support/ui/GameView";
import { EliminateData } from "../data/EliminateData";
import { EliminateEffect } from "../data/EliminateDefines";
import EliminateEffectsView from "./EliminateEffectsView";
import EliminateGridView from "./EliminateGridView";

//主游戏视图
const { ccclass, property } = cc._decorator;

@ccclass
export default class EliminateGameView extends GameView {

    static getPrefabUrl() {
        return "prefabs/EliminateGameView";
    }

    private effectsView : EliminateEffectsView = null;

    onLoad() {
        super.onLoad();

        let goback = cc.find("goBack", this.node);
        goback.on(cc.Node.EventType.TOUCH_END, this.onGoBack, this);

        //初始化游戏数据模型
        EliminateData.initGameModel();
        let gridView = cc.find("GridView", this.node);
        if (gridView) {
            let view = gridView.addComponent(EliminateGridView);
            view.view = this;
            view.initWithCellModels(EliminateData.gameModel.getCells());
        }

        let effectsView = cc.find("EffectsView",this.node);
        if( effectsView ){
            let view = effectsView.addComponent(EliminateEffectsView);
            view.view = this;
            this.effectsView = view;
        }

        this.audioHelper.playMusic("audios/gamescenebgm",this.bundle);

        //通知进入bundle完成
        dispatchEnterComplete({ type: td.Logic.Type.GAME, views: [this] });
    }

    private onGoBack() {
        dispatch(td.Logic.Event.ENTER_HALL);
    }

    playClick() {
        cc.log(`playClick : audios/click.bubble`);
        this.audioHelper.playEffect("audios/click.bubble",this.bundle);
    }

    playSwap() {
        cc.log(`playSwap : audios/swap`);
        this.audioHelper.playEffect("audios/swap",this.bundle);
    }

    playEliminate(step: number) {
        if( step < 1 ){
            step = 1;
        }
        step = Math.min(8,step);
        cc.log(`playEliminate : audios/eliminate${step}`);
        this.audioHelper.playEffect(`audios/eliminate${step}`,this.bundle);
    }

    playContinuousMatch(step: number) {
        cc.log(`playContinuousMatch : step ${step}`);
        step = Math.min(step,11);
        if( step < 2 ){
            return;
        }
        let arr = [3,5,7,9,11];
        let index = Math.floor(step/2) -1;
        let url = `audios/contnuousMatch${arr[index]}`;
        cc.log(`playContinuousMatch : ${url}`);
        this.audioHelper.playEffect(url,this.bundle);
    }

    playEffect(effects: EliminateEffect[]){
        if( this.effectsView ){
            this.effectsView.playEffect(effects);
        }
    }
}