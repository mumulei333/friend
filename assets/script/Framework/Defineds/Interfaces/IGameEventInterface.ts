export interface IGameEventInterface {

    /**@description 进入后台 cc.game.EVENT_HIDE*/
    onEnterBackground(): void;

    /**
     * @description 进入前台 cc.game.EVENT_SHOW
     * @param inBackgroundTime 在后台运行的总时间，单位秒
     */
    onEnterForgeground(inBackgroundTime: number): void;
}