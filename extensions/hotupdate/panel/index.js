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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const Tools_1 = require("../../common/Tools");
class _Helper {
    constructor() {
        this._isDoCreate = false;
        this.elements = {
            version: "#version",
            serverIP: "#serverIP",
            useLocalIP: "#useLocalIP",
            historyServerIPSelect: "#historyServerIPSelect",
            buildDir: "#buildDir",
            manifestDir: "#manifestDir",
            delBunles: "#delBunles",
            insertHotupdate: "#insertHotupdate",
            createManifest: "#createManifest",
            remoteUrl: "#remoteUrl",
            remoteDir: "#remoteDir",
            deployToRemote: "#deployToRemote",
            logView: "#logView",
            deployProgress: "#deployProgress",
            refreshMainVersion: "#refreshMainVersion", //主包地址刷新
        };
        /**@description 版本号*/
        this.uiVersion = null;
        /**@description 服务器地址*/
        this.uiServerIP = null;
        /**@description 使用本地地址*/
        this.uiUseLocalIP = null;
        /**@description 服务器历史地址*/
        this.uiHistoryServerIPSelect = null;
        /**@description 构建目录*/
        this.uiBuildDir = null;
        /**@description Manifest输出目录*/
        this.uiManifestDir = null;
        /**@description 删除bundle*/
        this.uiDelBunles = null;
        /**@description 插入热更新代码*/
        this.uiInsertHotupdate = null;
        /**@description 生成Manifest*/
        this.uiCreateManifest = null;
        /**@description 主包远程服务器地址*/
        this.uiRemoteUrl = null;
        /**@description 主包本地测试服务器目录*/
        this.uiRemoteDir = null;
        /**@description 部署*/
        this.uiDeployToRemote = null;
        /**@description 日志*/
        this.uiLogView = null;
        /**@description 部署进度*/
        this.uiDeployProgress = null;
        /**@description 主包地址刷新*/
        this.uiRefreshMainVersion = null;
        /**@description 界面元素 */
        this.uiBunldes = {};
        this._config = null;
        this.bundles = {};
        /**@description 本地缓存 */
        this.userCache = {
            /**@description 主包版本号 */
            version: "",
            /**@description 当前服务器地址 */
            serverIP: "",
            /**@description 服务器历史地址 */
            historyIps: [],
            historySelectedUrl: "",
            /**@description 构建项目目录 */
            buildDir: "",
            /**@description 各bundle的版本配置 */
            bundles: {},
            /**@description 远程服务器地址 */
            remoteUrl: "",
            /**@description 远程各bundle的版本配置 */
            remoteBundleUrls: {},
            /**@description 远程服务器所在目录 */
            remoteDir: "",
        };
    }
    static Instance() { return this._instance || (this._instance = new _Helper()); }
    get style() {
        return fs.readFileSync(path.join(__dirname, "./index.css"), "utf8");
    }
    get config() {
        if (this._config == null) {
            let configPath = path.join(__dirname, "../../../config/bundles.json");
            this._config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
        }
        return this._config;
    }
    get userCachePath() {
        return path.normalize(`${Editor.Project.path}/local/userCache.json`);
    }
    get template() {
        //读取界面
        let _template = fs.readFileSync(path.join(__dirname, "./index.html"), "utf8");
        //生成子游戏版本控制界面
        //生成子游戏测环境版本号
        let _subGameServerVersionView = ``;
        let _subGameVersionView = ``;
        for (let i = 0; i < this.config.bundles.length; i++) {
            let gameInfo = this.config.bundles[i];
            if (gameInfo.dir && gameInfo.dir.length > 0) {
                _subGameVersionView += `
        <ui-prop>
            <ui-label slot="label" class="titleColor" tooltip="${gameInfo.name}版本配置">${gameInfo.name}(${gameInfo.dir})</ui-label>
            <ui-checkbox id = "is${gameInfo.dir}includeApp" slot="content" class="titleColor" value="${gameInfo.includeApk}">是否包含在原始包内</ui-checkbox>
            <ui-input id = "${gameInfo.dir}Version" slot="content" class="contentColor"></ui-input>
        </ui-prop>`;
                //是否在包内
                this.elements[`is${gameInfo.dir}includeApp`] = `#is${gameInfo.dir}includeApp`;
                //版本号
                this.elements[`${gameInfo.dir}Version`] = `#${gameInfo.dir}Version`;
                _subGameServerVersionView += `
        <ui-prop>
            <ui-label slot="label" class="titleColor" tooltip="${gameInfo.name}(${gameInfo.dir})测试环境地址,显示格式 [版本号]:地址">${gameInfo.name}(${gameInfo.dir})</ui-label>
            <ui-label id = "${gameInfo.dir}remoteVersion" slot="content" class="titleColor">${this.config.packageUrl}</ui-label>
            <ui-button id = "refresh${gameInfo.dir}Version" slot="content">刷新</ui-button>
        </ui-prop>
        `;
                //子包的远程本机测试地址
                this.elements[`${gameInfo.dir}remoteVersion`] = `#${gameInfo.dir}remoteVersion`;
                this.elements[`refresh${gameInfo.dir}Version`] = `#refresh${gameInfo.dir}Version`;
                this.bundles[gameInfo.dir] = JSON.parse(JSON.stringify(gameInfo));
            }
        }
        let templateReplaceManifest = function templateReplace() {
            return arguments[1] + _subGameVersionView + arguments[3];
        };
        //添加子游戏版本配置
        _template = _template.replace(/(<!--subgame start-->)([\s\w\S]*)(<!--subgame end-->)/g, templateReplaceManifest);
        let templateReplaceTestManifest = function templateReplace() {
            return arguments[1] + _subGameServerVersionView + arguments[3];
        };
        //添加子游戏测试环境版本号
        _template = _template.replace(/(<!--subgame test start-->)([\s\w\S]*)(<!--subgame test end-->)/g, templateReplaceTestManifest);
        return _template;
    }
    getManifestDir(buildDir) {
        if (buildDir && buildDir.length > 0) {
            return buildDir + "\\manifest";
        }
        else {
            return "";
        }
    }
    /**@description 保存当前用户设置 */
    saveUserCache() {
        let cacheString = JSON.stringify(this.userCache);
        fs.writeFileSync(this.userCachePath, cacheString);
        // this.addLog(`写入缓存 :`, userCache);
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
        Object.keys(this.userCache.remoteBundleUrls).forEach((value) => {
            if (this.bundles[value] == undefined || this.bundles[value] == null) {
                notExist.push(value);
            }
        });
        for (let i = 0; i < notExist.length; i++) {
            delete this.userCache.remoteBundleUrls[notExist[i]];
            isRemoved = true;
        }
        return isRemoved;
    }
    /**@description 生成默认缓存 */
    generateDefaultUseCache() {
        this.userCache.version = this.config.version;
        this.userCache.serverIP = this.config.packageUrl;
        this.userCache.historyIps = [this.userCache.serverIP];
        this.userCache.buildDir = "";
        this.userCache.bundles = this.bundles;
        this.userCache.remoteUrl = "-";
        Object.keys(this.bundles).forEach((key) => {
            this.userCache.remoteBundleUrls[key] = "-";
        });
        this.userCache.remoteDir = "";
    }
    /**@description 读取本地缓存 */
    readCache() {
        if (fs.existsSync(this.userCachePath)) {
            let data = fs.readFileSync(this.userCachePath, "utf-8");
            this.userCache = JSON.parse(data);
            if (this.checkUserCache()) {
                this.saveUserCache();
            }
            //this.addLog(`存在缓存 : ${userCachePath}`, userCache);
        }
        else {
            //this.addLog(`不存在缓存 : ${userCachePath}`);
            this.generateDefaultUseCache();
            this.addLog(`生存默认缓存 : `, this.userCache);
            this.saveUserCache();
        }
    }
    /**@description 初始化UI数据 */
    initUIDatas() {
        this.uiVersion.value = this.userCache.version;
        this.uiServerIP.value = this.userCache.serverIP;
        setTimeout(() => {
            this.updateHistoryUrl();
            if (this.userCache.historySelectedUrl = "" && this.userCache.historyIps.length > 0) {
                this.userCache.historySelectedUrl = this.userCache.historyIps[0];
            }
            let isFind = false;
            let options = this.uiHistoryServerIPSelect.$select.options;
            for (let i = 0; i < options.length; i++) {
                if (options.text == this.userCache.historySelectedUrl) {
                    this.uiHistoryServerIPSelect.$select.value = i;
                    isFind = true;
                    break;
                }
            }
            if (!isFind) {
                this.userCache.historySelectedUrl = this.userCache.historyIps[0];
                this.uiHistoryServerIPSelect.$select.value = 0;
            }
        }, 10);
        this.uiBuildDir.value = this.userCache.buildDir;
        this.uiManifestDir.value = this.getManifestDir(this.userCache.buildDir);
        this.uiRemoteDir.value = this.userCache.remoteDir;
        //bundles 配置
        //`is${gameInfo.dir}includeApp`
        Object.keys(this.userCache.bundles).forEach((key) => {
            let bundle = this.uiBunldes[key];
            //是否在包内
            bundle.includeApp.value = this.userCache.bundles[key].includeApk;
            //版本号
            bundle.version.value = this.userCache.bundles[key].version;
        });
        //测试环境
        this.onRefreshMainVersion();
        Object.keys(this.userCache.bundles).forEach((key) => {
            this.onRefreshBundleLocalServerVersion(key);
        });
    }
    /**@description 返回远程版本号+md5 */
    getShowRemoteString(config) {
        return `[${config.version}] : ${config.md5}`;
    }
    /**@description 初始化数据 */
    initDatas() {
        this._isDoCreate = false;
        this.readCache();
        this.initUIDatas();
    }
    //插入热更新代码
    onInsertHotupdate() {
        let codePath = path.join(__dirname, "../code/hotupdate.js");
        let code = fs.readFileSync(codePath, "utf8");
        // console.log(code);
        let sourcePath = this.userCache.buildDir + "/main.js";
        let sourceCode = fs.readFileSync(sourcePath, "utf8");
        let templateReplace = function templateReplace() {
            // console.log(arguments);
            return arguments[1] + code + arguments[3];
        };
        //添加子游戏测试环境版本号
        sourceCode = sourceCode.replace(/(\);)([\s\w\S]*)(const[ ]*importMapJson)/g, templateReplace);
        this.addLog(`向${sourcePath}中插入热更新代码`);
        fs.writeFileSync(sourcePath, sourceCode, { "encoding": "utf8" });
    }
    onIncludeAppChange(element, key) {
        this.userCache.bundles[key].includeApk = element.value;
        this.saveUserCache();
    }
    /**@description 删除不包含在包内的bundles */
    onDelBundles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDoCreate())
                return;
            const config = {
                title: '警告',
                detail: '',
                buttons: ['取消', '确定'],
            };
            const code = yield Editor.Dialog.info('执行此操作将会删除不包含在包内的所有bundles,是否继续？', config);
            if (code.response == 1) {
                this.removeNotInApkBundle();
                this.remake();
            }
        });
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
            removeDirs.push(path.join(this.userCache.buildDir, `assets/${key}`));
            manifests.push(path.join(this.userCache.buildDir, `manifest/${key}_project.json`));
            manifests.push(path.join(this.userCache.buildDir, `manifest/${key}_version.json`));
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
     * @description 刷新测试环境主包信息
     */
    onRefreshMainVersion() {
        if (this.isDoCreate())
            return;
        if (this.userCache.remoteDir.length > 0) {
            let versionManifestPath = path.join(this.userCache.remoteDir, "manifest/main_version.json");
            fs.readFile(versionManifestPath, "utf-8", (err, data) => {
                if (err) {
                    this.addLog(`找不到 : ${versionManifestPath}`);
                }
                else {
                    let config = JSON.parse(data);
                    this.uiRemoteUrl.value = this.getShowRemoteString(config);
                    this.saveUserCache();
                }
            });
        }
        else {
            this.addLog(`只能刷新部署在本地的版本`);
        }
    }
    /**
     * @description 刷新测试环境子包信息
     * @param {*} key
     */
    onRefreshBundleLocalServerVersion(key) {
        if (this.isDoCreate())
            return;
        if (this.userCache.remoteDir.length > 0) {
            let versionManifestPath = path.join(this.userCache.remoteDir, `manifest/${key}_version.json`);
            fs.readFile(versionManifestPath, "utf-8", (err, data) => {
                if (err) {
                    this.addLog(`找不到 : ${versionManifestPath}`);
                }
                else {
                    let config = JSON.parse(data);
                    let bundle = this.uiBunldes[key];
                    bundle.remoteVersion.value = this.getShowRemoteString(config);
                    this.saveUserCache();
                }
            });
        }
        else {
            this.addLog(`只能刷新部署在本地的版本`);
        }
    }
    /**
     * @description 部署
     */
    onDeployToRemote() {
        if (this.isDoCreate())
            return;
        if (this.userCache.remoteDir.length <= 0) {
            this.addLog("[部署]请先选择本地服务器目录");
            return;
        }
        if (!fs.existsSync(this.userCache.remoteDir)) {
            this.addLog(`[部署]本地测试服务器目录不存在 : ${this.userCache.remoteDir}`);
            return;
        }
        if (!fs.existsSync(this.userCache.buildDir)) {
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
            let dir = path.join(this.userCache.buildDir, copyDirs[i]);
            if (!fs.existsSync(dir)) {
                this.addLog(`${this.userCache.buildDir} [部署]不存在${copyDirs[i]}目录,无法拷贝文件`);
                return;
            }
        }
        this.addLog(`[部署]开始拷贝文件到 : ${this.userCache.remoteDir}`);
        this.uiDeployProgress.value = 0;
        this.addLog(`[部署]删除旧目录 : ${this.userCache.remoteDir}`);
        let count = Tools_1.Tools.getDirFileCount(this.userCache.remoteDir);
        this.addLog(`[部署]删除文件个数:${count}`);
        Tools_1.Tools.delDir(this.userCache.remoteDir);
        count = 0;
        for (let i = 0; i < copyDirs.length; i++) {
            let dir = path.join(this.userCache.buildDir, copyDirs[i]);
            count += Tools_1.Tools.getDirFileCount(dir);
        }
        //压缩文件数量
        let zipPath = Editor.Project.path + "/PackageVersion";
        count += Tools_1.Tools.getDirFileCount(zipPath);
        this.addLog(`[部署]复制文件个数 : ${count}`);
        for (let i = 0; i < copyDirs.length; i++) {
            let source = path.join(this.userCache.buildDir, copyDirs[i]);
            let dest = path.join(this.userCache.remoteDir, copyDirs[i]);
            this.addLog(`[部署]复制${source} => ${dest}`);
            Tools_1.Tools.copySourceDirToDesDir(source, dest, () => {
                this.addProgress();
            });
        }
        let remoteZipPath = path.join(this.userCache.remoteDir, "zips");
        Tools_1.Tools.delDir(remoteZipPath);
        //部署压缩文件
        this.addLog(`[部署]复制${zipPath} => ${remoteZipPath}`);
        Tools_1.Tools.copySourceDirToDesDir(zipPath, remoteZipPath, () => {
            this.addProgress();
        });
    }
    addProgress() {
        let value = Number(this.uiDeployProgress.value);
        value = value + 1;
        if (value > 100) {
            value = 100;
        }
        this.uiDeployProgress.value = value;
    }
    /**@description 返回需要添加到主包版本的文件目录 */
    getMainBundleIncludes() {
        return [
            // "src", //这个里面会包含工程的插件脚本，如该工程的protobuf.js CryptoJS.js,如果考虑后面会升级，加入到里面
            // "jsb-adapter", //这个东西一般不会变，不用加载到版本控制中
            "assets/main",
            "assets/resources",
        ];
    }
    /**@description 生成manifest版本文件 */
    onCreateManifest(element) {
        if (this.isDoCreate())
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
        if (fs.existsSync(manifestDir)) {
            this.addLog("存在旧的，删除掉");
            Tools_1.Tools.delDir(manifestDir);
        }
        Tools_1.Tools.mkdirSync(manifestDir);
        //读出主包资源，生成主包版本
        let mainIncludes = this.getMainBundleIncludes();
        for (let i = 0; i < mainIncludes.length; i++) {
            Tools_1.Tools.readDir(path.join(buildDir, mainIncludes[i]), manifest.assets, buildDir);
        }
        //生成project.manifest
        let projectManifestPath = path.join(manifestDir, "main_project.json");
        let versionManifestPath = path.join(manifestDir, "main_version.json");
        let content = JSON.stringify(manifest);
        let md5 = require("crypto").createHash('md5').update(content).digest('hex');
        manifest.md5 = md5;
        manifest.version = version;
        fs.writeFileSync(projectManifestPath, JSON.stringify(manifest));
        this.addLog(`生成${projectManifestPath}成功`);
        delete manifest.assets;
        fs.writeFileSync(versionManifestPath, JSON.stringify(manifest));
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
            Tools_1.Tools.readDir(path.join(buildDir, `assets/${key}`), manifest.assets, buildDir);
            projectManifestPath = path.join(manifestDir, `${key}_project.json`);
            versionManifestPath = path.join(manifestDir, `${key}_version.json`);
            let content = JSON.stringify(manifest);
            let md5 = require("crypto").createHash('md5').update(content).digest('hex');
            manifest.md5 = md5;
            manifest.version = this.userCache.bundles[key].version;
            fs.writeFileSync(projectManifestPath, JSON.stringify(manifest));
            this.addLog(`生成${projectManifestPath}成功`);
            delete manifest.assets;
            versions[`${key}`] = {};
            versions[`${key}`].md5 = md5;
            versions[`${key}`].version = manifest.version;
            fs.writeFileSync(versionManifestPath, JSON.stringify(manifest));
            this.addLog(`生成${versionManifestPath}成功`);
        }
        //写入所有版本
        let versionsPath = path.join(manifestDir, `versions.json`);
        fs.writeFileSync(versionsPath, JSON.stringify(versions));
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
        this.remake();
        this._isDoCreate = false;
    }
    /**
     * @description 本地测试服务器选择确定
     * @param {*} element
     */
    onRemoteDirConfirm(element) {
        if (this.isDoCreate())
            return;
        this.userCache.remoteDir = element.value;
        this.saveUserCache();
    }
    /**
     * @description 构建目录选择
     * @param {*} element
     */
    onBuildDirConfirm(element) {
        if (this.isDoCreate())
            return;
        this.userCache.buildDir = element.value;
        this.uiManifestDir.value = this.getManifestDir(this.userCache.buildDir);
        this.saveUserCache();
    }
    /** @description 主版本号输入*/
    onVersionChange(element) {
        if (this.isDoCreate())
            return;
        let version = element.value;
        //有效版本
        this.userCache.version = version;
        this.saveUserCache();
    }
    /**
     * @description bundle输入版本号变化
     * @param {*} element
     * @param {*} key
     * @returns
     */
    onBundleVersionChange(element, key) {
        if (this.isDoCreate())
            return;
        let version = element.value;
        this.userCache.bundles[key].version = version;
        this.saveUserCache();
    }
    /**
     * @description 切换历史地址
     * @param element 控件自身
     */
    onHistoryServerIPChange(element) {
        if (this.isDoCreate())
            return;
        //先拿到选中项
        let options = this.uiHistoryServerIPSelect.$select.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value == element.value) {
                this.userCache.serverIP = options[i].text;
                break;
            }
        }
        this.onInputServerUrlOver();
    }
    /** @description 点击了使用本机*/
    onUseLocalIP() {
        if (this.isDoCreate())
            return;
        let network = require("os").networkInterfaces();
        let url = "";
        Object.keys(network).forEach((key) => {
            network[key].forEach((info) => {
                if (info.family == "IPv4" && !info.internal) {
                    url = info.address;
                }
            });
        });
        if (url.length > 0) {
            this.userCache.serverIP = "http://" + url;
        }
        this.onInputServerUrlOver();
    }
    /**
     * @description 输入服务器地址结束
     * @param {*} element
     * @returns
     */
    onInputServerUrlOver(element) {
        if (this.isDoCreate())
            return;
        let url = this.userCache.serverIP;
        if (element) {
            //从输入框过来的
            url = element.value;
            if (url.length <= 0) {
                return;
            }
        }
        if (/^(https?:\/\/)?([\da-z\.-]+)\.([\da-z\.]{2,6})([\/\w \.-:]*)*\/?$/.test(url) == false) {
            this.addLog(url + `不是以http://https://开头，或者不是网址`);
            return;
        }
        this.uiServerIP.value = url;
        this.userCache.serverIP = url;
        if (this.addHotAddress(url)) {
            this.updateHistoryUrl();
        }
        this.saveUserCache();
    }
    /**@description 更新历史地址 */
    updateHistoryUrl() {
        this.uiHistoryServerIPSelect.$select.options.length = 0;
        for (let i = 0; i < this.userCache.historyIps.length; i++) {
            let option = document.createElement("option");
            option.value = i.toString();
            option.text = this.userCache.historyIps[i];
            this.uiHistoryServerIPSelect.$select.options.add(option);
        }
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
    /**
     * @description 是否正在创建
     * @returns
     */
    isDoCreate() {
        if (this._isDoCreate) {
            this.addLog(`正在执行生成操作，请勿操作`);
        }
        return this._isDoCreate;
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
            console.log(message, obj);
        }
        else {
            console.log(message);
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
        let temp = this.uiLogView.value;
        if (temp.length > 0) {
            this.uiLogView.value = temp + "\n" + text;
        }
        else {
            this.uiLogView.value = text;
        }
        setTimeout(() => {
            this.uiLogView.$textarea.scrollTop = this.uiLogView.$textarea.scrollHeight;
        }, 10);
    }
    remake() {
        if (os.type() !== 'Darwin') { //判断mac os平台
            return;
        }
        const projectPath = Editor.Project.path;
        const nativeIosPath = projectPath + "/native/engine/ios";
        const iosProjPath = projectPath + "/build/ios/proj";
        const resPath = projectPath + "/build/ios";
        if (!fs.existsSync(resPath) || !fs.existsSync(nativeIosPath)) {
            return;
        }
        const prev = path.resolve(Editor.App.path, "..");
        const cmake = prev + "/tools/cmake/bin/cmake"; //cocos目录下的cmake执行程序
        console.log(cmake);
        const cmd = cmake + " with -S " + nativeIosPath + " -GXcode -B" + iosProjPath +
            " -DCMAKE_SYSTEM_NAME=iOS -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_C_COMPILER=clang -DRES_DIR=" + resPath;
        child_process_1.exec(cmd, { encoding: 'utf8' }, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
            }
            if (stderr) {
                console.log(stderr);
            }
            console.log(stdout);
        });
    }
    /**@description 绑定界面事件 */
    bindingEvents() {
        this.uiUseLocalIP.addEventListener("confirm", this.onUseLocalIP.bind(this));
        this.uiServerIP.addEventListener("blur", this.onInputServerUrlOver.bind(this, this.uiServerIP));
        this.uiHistoryServerIPSelect.addEventListener("change", this.onHistoryServerIPChange.bind(this, this.uiHistoryServerIPSelect));
        this.uiVersion.addEventListener("blur", this.onVersionChange.bind(this, this.uiVersion));
        //bundles 版本设置
        let keys = Object.keys(this.userCache.bundles);
        keys.forEach((key) => {
            let bundle = this.uiBunldes[key];
            //版本号
            bundle.version.addEventListener('blur', this.onBundleVersionChange.bind(this, bundle.version, key));
        });
        //选择构建目录
        this.uiBuildDir.addEventListener("confirm", this.onBuildDirConfirm.bind(this, this.uiBuildDir));
        //本地测试目录
        this.uiRemoteDir.addEventListener("confirm", this.onRemoteDirConfirm.bind(this, this.uiRemoteDir));
        //生成
        this.uiCreateManifest.addEventListener("confirm", this.onCreateManifest.bind(this, this.uiCreateManifest));
        //部署
        this.uiDeployToRemote.addEventListener("confirm", this.onDeployToRemote.bind(this));
        //主包地址刷新 
        this.uiRefreshMainVersion.addEventListener("confirm", this.onRefreshMainVersion.bind(this));
        //refresh${gameInfo.dir}Version 子包地址刷新
        keys.forEach((key) => {
            let bundle = this.uiBunldes[key];
            bundle.includeApp.addEventListener("confirm", this.onIncludeAppChange.bind(this, bundle.includeApp, key));
            bundle.refresh.addEventListener("confirm", this.onRefreshBundleLocalServerVersion.bind(this, key));
        });
        //删除不包含在包内的bundles
        this.uiDelBunles.addEventListener("confirm", this.onDelBundles.bind(this));
        //插入热更新代码
        this.uiInsertHotupdate.addEventListener("confirm", this.onInsertHotupdate.bind(this));
    }
    init() {
        this.initDatas();
        this.bindingEvents();
    }
}
_Helper._instance = null;
let Helper = _Helper.Instance();
//样式文本
exports.style = Helper.style;
exports.template = Helper.template;
//渲染html选择器
exports.$ = Helper.elements;
//本来想使用vue,但似乎在methods中调用this的函数，居然都未定义，所以就不用vue了
//面板上的方法,似乎不响应，郁闷
exports.methods = {
    init() {
        Helper.uiVersion = this.$.version; //版本号
        Helper.uiServerIP = this.$.serverIP; //服务器地址
        Helper.uiUseLocalIP = this.$.useLocalIP; //使用本地地址
        Helper.uiHistoryServerIPSelect = this.$.historyServerIPSelect; //服务器历史地址
        Helper.uiBuildDir = this.$.buildDir; //构建目录
        Helper.uiManifestDir = this.$.manifestDir; //Manifest输出目录
        Helper.uiDelBunles = this.$.delBunles; //删除bundle
        Helper.uiInsertHotupdate = this.$.insertHotupdate; //插入热更新代码
        Helper.uiCreateManifest = this.$.createManifest; //生成Manifest
        Helper.uiRemoteUrl = this.$.remoteUrl; //主包远程服务器地址
        Helper.uiRemoteDir = this.$.remoteDir; //主包本地测试服务器目录
        Helper.uiDeployToRemote = this.$.deployToRemote; //部署
        Helper.uiLogView = this.$.logView; //日志
        Helper.uiDeployProgress = this.$.deployProgress; //部署进度
        Helper.uiRefreshMainVersion = this.$.refreshMainVersion; //主包地址刷新
        let bundles = Helper.config.bundles;
        for (let i = 0; i < bundles.length; i++) {
            let info = bundles[i];
            let bundle = {};
            bundle.includeApp = this.$[`is${info.dir}includeApp`];
            bundle.version = this.$[`${info.dir}Version`];
            bundle.remoteVersion = this.$[`${info.dir}remoteVersion`];
            bundle.refresh = this.$[`refresh${info.dir}Version`];
            Helper.uiBunldes[info.dir] = bundle;
        }
        Helper.init();
    }
};
//面板上的解发事件
exports.listeners = {};
// 当面板渲染成功后触发
exports.ready = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.init();
    });
};
// 尝试关闭面板的时候触发
exports.beforeClose = function () {
    return __awaiter(this, void 0, void 0, function* () {
    });
};
// 当面板实际关闭后触发
exports.close = function () {
    return __awaiter(this, void 0, void 0, function* () {
    });
};