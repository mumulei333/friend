/**
 * @description 强制节点在当前帧进行一次布局 
 * @example
 * cc.updateAlignment(this.node);
 * */
cc.updateAlignment = function (node) {
    if (node) {
        //强制当前节点进行本帧强制布局
        let backcc: any = cc;
        if (backcc._widgetManager) {
            backcc._widgetManager.updateAlignment(node);
        } else {
            if (CC_DEBUG) cc.error(this._logTag, `引擎变化,原始引擎版本2.1.2，找不到cc._widgetManager`);
        }
    }
}