export namespace Macro {
    export let isSkipCheckUpdate = false
    export let EnableLayerManager = true
    /**@description 进入后台最大时间（单位秒）大于这个时间时就会进入重连*/
    export let MAX_INBACKGROUND_TIME = 60;
    /**@description 进入后台最小时间（单位秒）大于这个时间时就会进入重连*/
    export let MIN_INBACKGROUND_TIME = 5;

    export const BUNDLE_REMOTE = "__Remote__Caches__";
}