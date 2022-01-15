/**
 * @description bundle管理器
 */

import { AssetManager, assetManager } from "cc";
import { Macro } from "../../defines/Macros";
import { UpdateItem } from "../update/UpdateItem";

export class BundleManager {
   private static _instance: BundleManager = null!;
   public static Instance() { return this._instance || (this._instance = new BundleManager()); }
   protected isEngineBundle(key: string) {
      if (key == AssetManager.BuiltinBundleName.MAIN ||
         key == AssetManager.BuiltinBundleName.RESOURCES || key == AssetManager.BuiltinBundleName.START_SCENE) {
         return true;
      }
      return false;
   }

   /**@description 删除已经加载的bundle */
   public removeLoadedBundle(excludeBundles: string[]) {
      let loaded: string[] = [];
      assetManager.bundles.forEach((bundle, key) => {
         //引擎内置包不能删除
         if (!this.isEngineBundle(key)) {
            loaded.push(key);
         }
      });
      let i = loaded.length;
      while (i--) {
         let bundle = loaded[i];
         if (excludeBundles.indexOf(bundle) == -1) {
            //在排除bundle中找不到，直接删除
            Manager.entryManager.onUnloadBundle(bundle);
            let result = this.getBundle(bundle);
            if (result) {
               Manager.cacheManager.removeBundle(bundle);
               Manager.releaseManger.removeBundle(result);
            }
         }
      }
   }

   /**
    * @description 获取Bundle
    * @param bundle Bundle名|Bundle
    **/
   public getBundle(bundle: BUNDLE_TYPE) {
      if (bundle) {
         if (typeof bundle == "string") {
            return assetManager.getBundle(bundle);
         }
         return bundle;
      }
      return null;
   }

   public getBundleName(bundle: BUNDLE_TYPE): string {
      if (bundle) {
         if (typeof bundle == "string") {
            return bundle;
         } else {
            return bundle.name;
         }
      }
      Log.e(`输入参数错误 : ${bundle}`);
      return Macro.UNKNOWN;
   }

   /**
    * 外部接口 进入Bundle
    * @param config 配置
    */
   public enterBundle(config: UpdateItem | null) {
      if ( config ){
         Manager.updateManager.dowonLoad(config);
      }else{
         Log.e(`无效的入口信息`);
      }
   }

   public loadBundle(item:UpdateItem) {
      let bundle = this.getBundle(item.bundle);
      if (bundle) {
         Log.d(`${item.bundle}已经加载在缓存中，直接使用`);
         Manager.releaseManger.onLoadBundle(item.bundle);
         item.handler.onLoadBundleComplete(item);
         return;
      }
      item.handler.onStartLoadBundle(item);
      Log.d(`loadBundle : ${item.bundle}`);
      assetManager.loadBundle(item.bundle, (err, bundle) => {
         if (err) {
            Log.e(`load bundle : ${item.bundle} fail !!!`);
            item.handler.onLoadBundleError(item,err);
         } else {
            Manager.releaseManger.onLoadBundle(item.bundle);
            Log.d(`load bundle : ${item.bundle} success !!!`);
            item.handler.onLoadBundleComplete(item);
         }
      });
   }

   /**
    * @description 打印bundle管理器状态信息
    * @param delegate 
    */
   print(delegate: ManagerPrintDelegate<{
      loaded: AssetManager.Bundle[], //已在加载的bundle
   }>) {
      if (delegate) {
         let loaded: AssetManager.Bundle[] = [];
         assetManager.bundles.forEach((bundle, key) => {
            loaded.push(bundle);
         });
         delegate.print({
            loaded: loaded
         })
      }
   }
}
