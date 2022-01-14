"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helper = void 0;
const fs_1 = require("fs");
const path_1 = __importStar(require("path"));
const Tools_1 = require("./Tools");
const Electron = require("electron");
class Helper {
    constructor() {
        this._config = null;
        this.bundles = {};
        this.userCache = {
            /**@description 主包版本号 */
            version: "",
            /**@description 当前服务器地址 */
            serverIP: "",
            /**@description 服务器历史地址 */
            historyIps: [],
            /**@description 构建项目目录 */
            buildDir: "",
            /**@description 各bundle的版本配置 */
            bundles: {},
            /**@description 远程服务器地址 */
            remoteVersion: "",
            /**@description 远程各bundle的版本配置 */
            remoteBundles: {},
            /**@description 远程服务器所在目录 */
            remoteDir: "",
        };
        this.logArea = null;
        this._isDoCreate = false;
        this.progressFuc = null;
        this.getProgressFunc = null;
    }
    init() {
        this.config;
        this.readCache();
    }
    get config() {
        if (this._config == null) {
            let configPath = path_1.default.join(Editor.Project.path, "config/bundles.json");
            this._config = JSON.parse(fs_1.readFileSync(configPath, { encoding: "utf-8" }));
            for (let i = 0; i < this._config.bundles.length; i++) {
                this.bundles[this._config.bundles[i].dir] = this._config.bundles[i];
            }
        }
        return this._config;
    }
    get userCachePath() {
        return path_1.default.join(Editor.Project.path, "local/userCache.json");
    }
    /**@description 检证数据 */
    checkUserCache() {
        //把不存在的bundle信息删除
        let notExist = [];
        Object.keys(this.userCache.bundles).forEach((value) => {
            if (this.bundles[value] == undefined || this.bundles[value] == null) {
                notExist.push(value);
            }
        });
        let isRemoved = false;
        for (let i = 0; i < notExist.length; i++) {
            delete this.userCache.bundles[notExist[i]];
            isRemoved = true;
        }
        notExist = [];
        this.userCache.remoteBundles = {};
        Object.keys(this.bundles).forEach((value) => {
            this.userCache.remoteBundles[value] = JSON.parse(JSON.stringify(this.bundles[value]));
        });
        this.userCache.remoteVersion = this.remoteVersion;
        Object.keys(this.userCache.remoteBundles).forEach((value) => {
            this.userCache.remoteBundles[value].md5 = this.getBundleVersion(value);
        });
        //需要加的加上
        Object.keys(this.bundles).forEach((key) => {
            if (!this.userCache.bundles[key]) {
                this.userCache.bundles[key] = this.bundles[key];
                this.userCache.remoteBundles[key] = Object.assign({}, this.bundles[key]);
                this.userCache.remoteBundles[key].md5 = '-';
                isRemoved = true;
            }
        });
        return isRemoved;
    }
    /**@description 返回远程版本号+md5 */
    getShowRemoteString(config) {
        return `[${config.version}] : ${config.md5}`;
    }
    get remoteVersion() {
        return this.getBundleVersion("main");
    }
    /**
     * @description 刷新测试环境子包信息
     * @param {*} key
     */
    getBundleVersion(key) {
        if (this.userCache.remoteDir.length > 0) {
            let versionManifestPath = path_1.default.join(this.userCache.remoteDir, `manifest/${key}_version.json`);
            if (fs_1.existsSync(versionManifestPath)) {
                let data = fs_1.readFileSync(versionManifestPath, { encoding: "utf-8" });
                let config = JSON.parse(data);
                return this.getShowRemoteString(config);
            }
            else {
                this.addLog(versionManifestPath + "不存在");
            }
        }
        return "-";
    }
    onRefreshVersion(dir) {
        console.log(dir);
        if (dir) {
            this.userCache.remoteBundles[dir].md5 = this.getBundleVersion(dir);
        }
        else {
            this.userCache.remoteVersion = this.remoteVersion;
        }
        this.saveUserCache();
    }
    /**@description 保存当前用户设置 */
    saveUserCache() {
        let cacheString = JSON.stringify(this.userCache);
        fs_1.writeFileSync(this.userCachePath, cacheString);
        // this.addLog(`写入缓存 :`, this.userCache);
    }
    /**@description 生成默认缓存 */
    generateDefaultUseCache() {
        this.userCache.version = this.config.version;
        this.userCache.historyIps = [];
        this.userCache.buildDir = "";
        this.userCache.bundles = this.bundles;
        this.userCache.remoteVersion = "-";
        this.userCache.remoteBundles = JSON.parse(JSON.stringify(this.bundles));
        Object.keys(this.bundles).forEach((key) => {
            this.userCache.remoteBundles[key].md5 = "-";
        });
        this.userCache.remoteDir = "";
    }
    /**@description 读取本地缓存 */
    readCache() {
        if (fs_1.existsSync(this.userCachePath)) {
            let data = fs_1.readFileSync(this.userCachePath, "utf-8");
            this.userCache = JSON.parse(data);
            if (this.checkUserCache()) {
                this.saveUserCache();
            }
            // this.addLog(`存在缓存 : ${this.userCachePath}`, this.userCache);
        }
        else {
            this.addLog(`不存在缓存 : ${this.userCachePath}`);
            this.generateDefaultUseCache();
            this.addLog(`生存默认缓存 : `, this.userCache);
            this.saveUserCache();
        }
    }
    /**
     * @description 添加日志
     * @param {*} message
     * @param {*} obj
     * @returns
     */
    addLog(message, obj = null) {
        if (typeof obj == "function") {
            return;
        }
        if (obj) {
            Editor.log(message, obj);
        }
        else {
            Editor.log(message);
        }
        if (!this.logArea) {
            return;
        }
        let text = "";
        if (obj == null) {
            text = message;
        }
        else if (typeof obj == "object") {
            text = message + JSON.stringify(obj);
        }
        else {
            text = message + obj.toString();
        }
        let temp = this.logArea.value;
        if (temp.length > 0) {
            this.logArea.value = temp + "\n" + text;
        }
        else {
            this.logArea.value = text;
        }
        setTimeout(() => {
            this.logArea.scrollTop = this.logArea.scrollHeight;
        }, 10);
    }
    get cache() {
        return this.userCache;
    }
    get isDoCreate() {
        if (this._isDoCreate) {
            this.addLog(`正在执行生成操作，请勿操作`);
        }
        return this._isDoCreate;
    }
    set isDoCreate(v) {
        this._isDoCreate = v;
    }
    /**
     * @description 添加历史地址
     * @param url
     * */
    addHotAddress(url) {
        if (this.userCache.historyIps.indexOf(url) == -1) {
            this.userCache.historyIps.push(url);
            this.addLog(`添加历史记录 :${url} 成功`);
            return true;
        }
        return false;
    }
    getManifestDir(buildDir) {
        if (buildDir && buildDir.length > 0) {
            return buildDir + "\\manifest";
        }
        else {
            return "";
        }
    }
    //插入热更新代码
    onInsertHotupdate() {
        let codePath = path_1.default.join(Editor.Project.path, "extensions/hotupdate/code/hotupdate.js");
        let code = fs_1.readFileSync(codePath, "utf8");
        // console.log(code);
        let sourcePath = this.userCache.buildDir + "/main.js";
        let sourceCode = fs_1.readFileSync(sourcePath, "utf8");
        let templateReplace = function templateReplace() {
            // console.log(arguments);
            return arguments[1] + code + arguments[3];
        };
        //添加子游戏测试环境版本号
        sourceCode = sourceCode.replace(/(\);)([\s\w\S]*)(const[ ]*importMapJson)/g, templateReplace);
        this.addLog(`向${sourcePath}中插入热更新代码`);
        fs_1.writeFileSync(sourcePath, sourceCode, { "encoding": "utf8" });
    }
    /**@description 生成manifest版本文件 */
    onCreateManifest() {
        if (this.isDoCreate)
            return;
        this._isDoCreate = true;
        this.saveUserCache();
        this.addLog(`当前用户配置为 : `, this.userCache);
        this.addLog("开始生成Manifest配置文件...");
        let version = this.userCache.version;
        this.addLog("主包版本号:", version);
        let buildDir = this.userCache.buildDir;
        buildDir = buildDir.replace(/\\/g, "/");
        this.addLog("构建目录:", buildDir);
        let manifestDir = this.getManifestDir(buildDir);
        manifestDir = manifestDir.replace(/\\/g, "/");
        this.addLog("构建目录下的Manifest目录:", manifestDir);
        let serverUrl = this.userCache.serverIP;
        this.addLog("热更新地址:", serverUrl);
        let subBundles = Object.keys(this.userCache.bundles);
        this.addLog("所有子包:", subBundles);
        let manifest = {
            assets: {},
            bundle: "main"
        };
        //删除旧的版本控件文件
        this.addLog("删除旧的Manifest目录", manifestDir);
        if (fs_1.existsSync(manifestDir)) {
            this.addLog("存在旧的，删除掉");
            Tools_1.Tools.delDir(manifestDir);
        }
        Tools_1.Tools.mkdirSync(manifestDir);
        //读出主包资源，生成主包版本
        let mainIncludes = this.getMainBundleIncludes();
        for (let i = 0; i < mainIncludes.length; i++) {
            Tools_1.Tools.readDir(path_1.default.join(buildDir, mainIncludes[i]), manifest.assets, buildDir);
        }
        //生成project.manifest
        let projectManifestPath = path_1.default.join(manifestDir, "main_project.json");
        let versionManifestPath = path_1.default.join(manifestDir, "main_version.json");
        let content = JSON.stringify(manifest);
        let md5 = require("crypto").createHash('md5').update(content).digest('hex');
        manifest.md5 = md5;
        manifest.version = version;
        fs_1.writeFileSync(projectManifestPath, JSON.stringify(manifest));
        this.addLog(`生成${projectManifestPath}成功`);
        delete manifest.assets;
        fs_1.writeFileSync(versionManifestPath, JSON.stringify(manifest));
        this.addLog(`生成${versionManifestPath}成功`);
        //生成所有版本控制文件，用来判断当玩家停止在版本1，此时发版本2时，不让进入游戏，返回到登录，重新走完整个更新流程
        let versions = {
            main: { md5: md5, version: version },
        };
        //生成各bundles版本文件
        for (let i = 0; i < subBundles.length; i++) {
            let key = subBundles[i];
            this.addLog(`正在生成:${key}`);
            let manifest = {
                assets: {},
                bundle: key
            };
            Tools_1.Tools.readDir(path_1.default.join(buildDir, `assets/${key}`), manifest.assets, buildDir);
            projectManifestPath = path_1.default.join(manifestDir, `${key}_project.json`);
            versionManifestPath = path_1.default.join(manifestDir, `${key}_version.json`);
            let content = JSON.stringify(manifest);
            let md5 = require("crypto").createHash('md5').update(content).digest('hex');
            manifest.md5 = md5;
            manifest.version = this.userCache.bundles[key].version;
            fs_1.writeFileSync(projectManifestPath, JSON.stringify(manifest));
            this.addLog(`生成${projectManifestPath}成功`);
            delete manifest.assets;
            versions[`${key}`] = {};
            versions[`${key}`].md5 = md5;
            versions[`${key}`].version = manifest.version;
            fs_1.writeFileSync(versionManifestPath, JSON.stringify(manifest));
            this.addLog(`生成${versionManifestPath}成功`);
        }
        //写入所有版本
        let versionsPath = path_1.default.join(manifestDir, `versions.json`);
        fs_1.writeFileSync(versionsPath, JSON.stringify(versions));
        this.addLog(`生成versions.json成功`);
        Tools_1.Tools.zipVersions({
            /**@description 主包包含目录 */
            mainIncludes: mainIncludes,
            /**@description 所有版本信息 */
            versions: versions,
            /**@description 构建目录 */
            buildDir: this.userCache.buildDir,
            /**@description 日志回调 */
            log: (data) => {
                this.addLog(data);
            },
            /**@description 所有bundle的配置信息 */
            bundles: this.config.bundles
        });
        this._isDoCreate = false;
    }
    /**@description 返回需要添加到主包版本的文件目录 */
    getMainBundleIncludes() {
        return [
            "src",
            "jsb-adapter",
            "assets/main",
            "assets/resources",
            "assets/internal"
        ];
    }
    /**@description 删除不包含在包内的bundles */
    async onDelBundles() {
        if (this.isDoCreate)
            return;
        //弹出提示确定是否需要删除当前的子游戏
        Editor.Panel.open('confirm_del_subgames');
    }
    /**@description 删除不包含在包内的所有bundles */
    removeNotInApkBundle() {
        let keys = Object.keys(this.userCache.bundles);
        let removeBundles = [];
        keys.forEach((key) => {
            if (!this.userCache.bundles[key].includeApk) {
                removeBundles.push(key);
            }
        });
        let manifests = [];
        let removeDirs = [];
        for (let i = 0; i < removeBundles.length; i++) {
            let key = removeBundles[i];
            removeDirs.push(path_1.default.join(this.userCache.buildDir, `assets/${key}`));
            manifests.push(path_1.default.join(this.userCache.buildDir, `manifest/${key}_project.json`));
            manifests.push(path_1.default.join(this.userCache.buildDir, `manifest/${key}_version.json`));
        }
        for (let i = 0; i < removeDirs.length; i++) {
            this.addLog(`删除目录 : ${removeDirs[i]}`);
            Tools_1.Tools.delDir(removeDirs[i], true);
        }
        for (let i = 0; i < manifests.length; i++) {
            this.addLog(`删除版本文件 : ${manifests[i]}`);
            Tools_1.Tools.delFile(manifests[i]);
        }
    }
    /**
     * @description 部署
     */
    onDeployToRemote() {
        if (this.isDoCreate)
            return;
        if (this.userCache.remoteDir.length <= 0) {
            this.addLog("[部署]请先选择本地服务器目录");
            return;
        }
        if (!fs_1.existsSync(this.userCache.remoteDir)) {
            this.addLog(`[部署]本地测试服务器目录不存在 : ${this.userCache.remoteDir}`);
            return;
        }
        if (!fs_1.existsSync(this.userCache.buildDir)) {
            this.addLog(`[部署]构建目录不存在 : ${this.userCache.buildDir} , 请先构建`);
            return;
        }
        let includes = this.getMainBundleIncludes();
        let temps = [];
        for (let i = 0; i < includes.length; i++) {
            //只保留根目录
            let dir = includes[i];
            let index = dir.search(/\\|\//);
            if (index == -1) {
                if (temps.indexOf(dir) == -1) {
                    temps.push(dir);
                }
            }
            else {
                dir = dir.substr(0, index);
                if (temps.indexOf(dir) == -1) {
                    temps.push(dir);
                }
            }
        }
        let copyDirs = ["manifest"].concat(temps);
        for (let i = 0; i < copyDirs.length; i++) {
            let dir = path_1.default.join(this.userCache.buildDir, copyDirs[i]);
            dir = path_1.normalize(dir);
            if (!fs_1.existsSync(dir)) {
                this.addLog(`${this.userCache.buildDir} [部署]不存在${copyDirs[i]}目录,无法拷贝文件`);
                return;
            }
        }
        this.addLog(`[部署]开始拷贝文件到 : ${this.userCache.remoteDir}`);
        this.resetProgress();
        this.addLog(`[部署]删除旧目录 : ${this.userCache.remoteDir}`);
        let count = Tools_1.Tools.getDirFileCount(this.userCache.remoteDir);
        this.addLog(`[部署]删除文件个数:${count}`);
        Tools_1.Tools.delDir(this.userCache.remoteDir);
        count = 0;
        for (let i = 0; i < copyDirs.length; i++) {
            let dir = path_1.default.join(this.userCache.buildDir, copyDirs[i]);
            dir = path_1.normalize(dir);
            count += Tools_1.Tools.getDirFileCount(dir);
        }
        //压缩文件数量
        let zipPath = Editor.Project.path + "/PackageVersion";
        zipPath = path_1.normalize(zipPath);
        count += Tools_1.Tools.getDirFileCount(zipPath);
        this.addLog(`[部署]复制文件个数 : ${count}`);
        for (let i = 0; i < copyDirs.length; i++) {
            let source = path_1.default.join(this.userCache.buildDir, copyDirs[i]);
            let dest = path_1.default.join(this.userCache.remoteDir, copyDirs[i]);
            this.addLog(`[部署]复制${source} => ${dest}`);
            Tools_1.Tools.copySourceDirToDesDir(source, dest, () => {
                this.addProgress();
            });
        }
        let remoteZipPath = path_1.default.join(this.userCache.remoteDir, "zips");
        Tools_1.Tools.delDir(remoteZipPath);
        //部署压缩文件
        this.addLog(`[部署]复制${zipPath} => ${remoteZipPath}`);
        Tools_1.Tools.copySourceDirToDesDir(zipPath, remoteZipPath, () => {
            this.addProgress();
        });
    }
    addProgress() {
        let value = Number(this.getProgressFunc());
        value = value + 1;
        if (value > 100) {
            value = 100;
        }
        this.progressFuc(value);
    }
    resetProgress() {
        this.progressFuc(0);
    }
    checkBuildDir(fullPath) {
        if (fs_1.existsSync(fullPath)) {
            //检测是否存在src / assets目录
            let srcPath = path_1.default.join(fullPath, "src");
            srcPath = path_1.normalize(srcPath);
            let assetsPath = path_1.default.join(fullPath, "assets");
            assetsPath = path_1.normalize(assetsPath);
            if (fs_1.existsSync(srcPath) && fs_1.existsSync(assetsPath)) {
                return true;
            }
        }
        this.addLog(`请先构建项目`);
        return false;
    }
    openDir(dir) {
        if (fs_1.existsSync(dir)) {
            dir = path_1.normalize(dir);
            Electron.shell.showItemInFolder(dir);
            Electron.shell.beep();
        }
        else {
            this.addLog("目录不存在：" + dir);
        }
    }
}
exports.helper = new Helper();