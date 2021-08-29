import { UIView } from "../../framework/support/ui/UIView";
import { i18n } from "../language/CommonLanguage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingView extends UIView {

    public static getPrefabUrl() {
        return "common/prefabs/SettingView";
    }

    private musicStatus: cc.Toggle = null;
    private effectStatus: cc.Toggle = null;
    private musicVolume: cc.Slider = null;
    private effectVolume: cc.Slider = null;

    onLoad() {
        super.onLoad();

        this.content = cc.find("content", this.node);
        let close = cc.find("close",this.content);
        close.on(cc.Node.EventType.TOUCH_END, this.onClose, this);

        let quit = cc.find("background/quit",this.content);
        quit.on(cc.Node.EventType.TOUCH_END, this.onQuit, this);

        let music = cc.find("background/musicVolume",this.content);
        music.on("slide", this.onMusicVolumeChange, this);

        let effect = cc.find("background/effectVolume",this.content);
        effect.on('slide', this.onEffectVolumeChange, this);
        this.musicVolume = music.getComponent(cc.Slider);
        this.effectVolume = effect.getComponent(cc.Slider);
        this.musicVolume.progress = Manager.globalAudio.musicVolume;
        this.effectVolume.progress = Manager.globalAudio.effectVolume;
        this.onMusicVolumeChange(this.musicVolume);
        this.onEffectVolumeChange(this.effectVolume);

        let musicStatusNode = cc.find("background/musicStatus",this.content);
        this.musicStatus = musicStatusNode.getComponent(cc.Toggle);
        let effectStatusNode = cc.find("background/effectStatus",this.content);
        this.effectStatus = effectStatusNode.getComponent(cc.Toggle);
        musicStatusNode.on("toggle", this.onMusicStatusChange, this);
        effectStatusNode.on("toggle", this.onEffectStatusChange, this);
        this.musicStatus.isChecked = Manager.globalAudio.isMusicOn;
        this.effectStatus.isChecked = Manager.globalAudio.isEffectOn;
        this.onMusicStatusChange(this.musicStatus, false);
        this.onEffectStatusChange(this.effectStatus, false);

        this.showWithAction();
    }

    private onClose() {
        this.closeWithAction();
    }

    private onQuit() {
        this.closeWithAction();
        Manager.alert.show({
            immediatelyCallback: true,
            text: i18n.quitGame,
            confirmCb: (isOk) => {
                if (isOk) {
                    dispatch(td.Logic.Event.ENTER_LOGIN);
                }
            },
        });
    }

    private onMusicVolumeChange(target: cc.Slider) {
        Manager.globalAudio.musicVolume = target.progress;
        target.node.getComponent(cc.ProgressBar).progress = target.progress;
    }

    private onEffectVolumeChange(target: cc.Slider) {
        Manager.globalAudio.effectVolume = target.progress;
        target.node.getComponent(cc.ProgressBar).progress = target.progress;
    }

    private onMusicStatusChange(target: cc.Toggle, isPlay: boolean) {
        if( isPlay == undefined ) Manager.globalAudio.playButtonClick();
        target.node.getChildByName("off").active = !target.isChecked;
        Manager.globalAudio.isMusicOn = target.isChecked;
    }

    private onEffectStatusChange(target: cc.Toggle, isPlay: boolean) {
        if( isPlay == undefined ) Manager.globalAudio.playButtonClick();
        target.node.getChildByName("off").active = !target.isChecked;
        Manager.globalAudio.isEffectOn = target.isChecked;
    }
}