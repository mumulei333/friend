import * as fs from "fs";
import * as path from "path";

interface ConfigData{
    path:string,
    name:string,
    desc:string,
}
export class _Helper {

    /**@description creator 版本号 */
    private get appVersion(){
        return Editor.App.version;
    }

    /**@description creator 安所路径 */
    private _path : string | null = null;
    private get appPath(){
        if( this._path ){
            return this._path;
        }
        this._path = Editor.App.path;
        //D:\Creator\Creator\3.1.0\resources\app.asar
        let parser = path.parse(this._path);
        this._path = parser.dir;
        return this._path;
    }

    private _engineRoot : string | null = null;
    private get engineRoot(){
        if( this._engineRoot ){
            return this._engineRoot;
        }
        let root = this.appPath + "/resources/3d/engine-native";
        root = path.normalize(root);
        this._engineRoot = root;
        return this._engineRoot;
    }

    private _config : any = null;
    private get config(){
        if( this._config ){
            return this._config;
        }
        let source = fs.readFileSync(path.join(__dirname,"../engine/config.json"),"utf-8");
        this._config = JSON.parse(source);
        return this._config;
    }

    run(){
        if (this.appVersion == "3.1.0") {
            console.log("Creator 版本 : " + this.appVersion);
        }else{
            console.log(`该插件只能使用在3.1.0版本的Creator`);
            console.log("请自己手动对比extensions/fix_engine/engine目录下对引擎的修改");
            return;
        }
        console.log("Creator 安装路径 : " + this.appPath);
        console.log("Creator 引擎路径 : " + this.engineRoot);

        let keys = Object.keys(this.config);
        for( let i = 0 ; i < keys.length ; i++ ){
            let data : ConfigData = this.config[keys[i]];
            if( data.name == "version.json"){
                //直接把版本文件写到creator目录下
                let destPath = `${this.appPath}/${data.path}`;
                destPath = path.normalize(destPath);
                let sourcePath = `${path.join(__dirname,`../engine/${data.name}`)}`;
                sourcePath = path.normalize(sourcePath);
                let sourceData = fs.readFileSync(sourcePath,"utf-8");
                fs.writeFileSync(destPath,sourceData,{ encoding : "utf-8"});
                console.log(data.desc);
            }else{
                //查看本地是否有文件
                let sourcePath = `${path.join(__dirname,`../engine/${data.name}`)}`;
                sourcePath = path.normalize(sourcePath);
                let destPath = `${this.engineRoot}/${data.path}`;
                destPath = path.normalize(destPath);
                if( fs.existsSync(sourcePath) ){
                    let sourceData = fs.readFileSync(sourcePath,"utf-8");
                    fs.writeFileSync(destPath,sourceData,{encoding:"utf-8"});
                    console.log(data.desc);
                }
            }
        }
    }
}
const Helper = new _Helper();

/**
* @en 
* @zh 为扩展的主进程的注册方法
*/
export const methods = {
    fixEngine() {
        Helper.run();
    }
};

/**
* @en Hooks triggered after extension loading is complete
* @zh 扩展加载完成后触发的钩子
*/
export const load = function () {
    console.log("加载fix_engine");
};

/**
* @en Hooks triggered after extension uninstallation is complete
* @zh 扩展卸载完成后触发的钩子
*/
export const unload = function () {
    console.log("卸载fix_engine");
};