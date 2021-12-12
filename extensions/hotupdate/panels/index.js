"use strict";
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;
const os = require('os');
//样式文本
exports.style = fs.readFileSync(path.join(__dirname, "./index.css"), "utf8");

const elements = {
    version: "#version",//版本号
    serverIP: "#serverIP",//服务器地址
    useLocalIP: "#useLocalIP",//使用本地地址
    historyServerIPSelect: "#historyServerIPSelect",//服务器历史地址
    buildDir: "#buildDir",//构建目录
    manifestDir: "#manifestDir",//Manifest输出目录
    delBunles: "#delBunles",//删除bundle
    insertHotupdate: "#insertHotupdate",//插入热更新代码
    createManifest: "#createManifest",//生成Manifest
    remoteUrl: "#remoteUrl",//主包远程服务器地址
    remoteDir: "#remoteDir",//主包本地测试服务器目录
    deployToRemote: "#deployToRemote",//部署
    logView: "#logView",//日志
    deployProgress: "#deployProgress",//部署进度
    refreshMainVersion: "#refreshMainVersion",//主包地址刷新
}

const gamesConfigPath = path.join(__dirname, "../../../config/bundles.json");
const gamesConfig = JSON.parse(fs.readFileSync(gamesConfigPath));
let bundles = {};
//html文本
function GenerateTemplate() {
    //读取界面
    let _template = fs.readFileSync(path.join(__dirname, "./index.html"), "utf8");
    //先读取子游戏配置
    let _gamesConfig = gamesConfig;
    let _subGameVersion = {};
    //生成子游戏版本控制界面
    //生成子游戏测环境版本号
    let _subGameServerVersionView = ``;
    let _subGameVersionView = ``;
    let _subGameServerVersion = {};
    //子游戏是否包含
    let _subGameInclude = {};
    for (let i = 0; i < _gamesConfig.bundles.length; i++) {
        let gameInfo = _gamesConfig.bundles[i];
        if (gameInfo.dir && gameInfo.dir.length > 0) {
            _subGameVersionView += `
        <ui-prop>
            <ui-label slot="label" class="titleColor" tooltip="${gameInfo.name}版本配置">${gameInfo.name}(${gameInfo.dir})</ui-label>
            <ui-checkbox id = "is${gameInfo.dir}includeApp" slot="content" class="titleColor" value="${gameInfo.includeApk}">是否包含在原始包内</ui-checkbox>
            <ui-input id = "${gameInfo.dir}Version" slot="content" class="contentColor"></ui-input>
        </ui-prop>`;
            _subGameVersion[`${gameInfo.dir}`] = gameInfo.version;
            _subGameInclude[`${gameInfo.dir}`] = gameInfo.includeApk;
            _subGameServerVersion[`${gameInfo.dir}`] = '-';
            //是否在包内
            elements[`is${gameInfo.dir}includeApp`] = `#is${gameInfo.dir}includeApp`;
            //版本号
            elements[`${gameInfo.dir}Version`] = `#${gameInfo.dir}Version`;
            _subGameServerVersionView += `
        <ui-prop>
            <ui-label slot="label" class="titleColor" tooltip="${gameInfo.name}(${gameInfo.dir})测试环境地址,显示格式 [版本号]:地址">${gameInfo.name}(${gameInfo.dir})</ui-label>
            <ui-label id = "${gameInfo.dir}remoteUrl" slot="content" class="titleColor">${_gamesConfig.packageUrl}</ui-label>
            <ui-button id = "refresh${gameInfo.dir}Version" slot="content">刷新</ui-button>
        </ui-prop>
        `;
            //子包的远程本机测试地址
            elements[`${gameInfo.dir}remoteUrl`] = `#${gameInfo.dir}remoteUrl`;
            elements[`refresh${gameInfo.dir}Version`] = `#refresh${gameInfo.dir}Version`;
            bundles[gameInfo.dir] = JSON.parse(JSON.stringify(gameInfo));
        }
    }

    let templateReplaceManifest = function templateReplace() {
        return arguments[1] + _subGameVersionView + arguments[3];
    }
    //添加子游戏版本配置
    _template = _template.replace(/(<!--subgame start-->)([\s\w\S]*)(<!--subgame end-->)/g, templateReplaceManifest);

    let templateReplaceTestManifest = function templateReplace() {
        return arguments[1] + _subGameServerVersionView + arguments[3];
    }
    //添加子游戏测试环境版本号
    _template = _template.replace(/(<!--subgame test start-->)([\s\w\S]*)(<!--subgame test end-->)/g, templateReplaceTestManifest);

    return _template;
}

/**@description 本地缓存 */
let userCache = {
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
}

const userCachePath = path.normalize(`${Editor.Project.path}/local/userCache.json`);

exports.template = GenerateTemplate();
//渲染html选择器
exports.$ = elements;
//本来想使用vue,但似乎在methods中调用this的函数，居然都未定义，所以就不用vue了
//面板上的方法,似乎不响应，郁闷
exports.methods = {
    getManifestDir(buildDir) {
        if (buildDir && buildDir.length > 0) {
            return buildDir + "\\manifest";
        } else {
            return "";
        }
    },
    /**@description 保存当前用户设置 */
    saveUserCache() {
        let cacheString = JSON.stringify(userCache);
        fs.writeFileSync(userCachePath, cacheString);
        // this.addLog(`写入缓存 :`, userCache);
    },
    /**@description 检证数据 */
    checkUserCache() {
        //把不存在的bundle信息删除

        let notExist = [];
        Object.keys(userCache.bundles).forEach((value) => {
            if (bundles[value] == undefined || bundles[value] == null) {
                notExist.push(value);
            }
        });
        let isRemoved = false;
        for (let i = 0; i < notExist.length; i++) {
            delete userCache.bundles[notExist[i]];
            isRemoved = true;
        }

        notExist = [];
        Object.keys(userCache.remoteBundleUrls).forEach((value) => {
            if (bundles[value] == undefined || bundles[value] == null) {
                notExist.push(value);
            }
        });

        for (let i = 0; i < notExist.length; i++) {
            delete userCache.remoteBundleUrls[notExist[i]];
            isRemoved = true;
        }

        return isRemoved;
    },
    /**@description 生成默认缓存 */
    generateDefaultUseCache() {
        userCache.version = gamesConfig.version;
        userCache.serverIP = gamesConfig.packageUrl;
        userCache.historyIps = [userCache.serverIP];
        userCache.buildDir = "";
        userCache.bundles = bundles;
        userCache.remoteUrl = "-";
        Object.keys(bundles).forEach((key) => {
            userCache.remoteBundleUrls[key] = "-";
        });
        userCache.remoteDir = "";
    },
    /**@description 读取本地缓存 */
    readCache() {
        if (fs.existsSync(userCachePath)) {
            let data = fs.readFileSync(userCachePath, "utf-8")
            userCache = JSON.parse(data);
            if (this.checkUserCache()) {
                this.saveUserCache();
            }
            //this.addLog(`存在缓存 : ${userCachePath}`, userCache);
        } else {
            //this.addLog(`不存在缓存 : ${userCachePath}`);
            this.generateDefaultUseCache();
            this.addLog(`生存默认缓存 : `, userCache);
            this.saveUserCache();
        }
    },
    /**@description 初始化UI数据 */
    initUIDatas() {
        this.$.version.value = userCache.version;
        this.$.serverIP.value = userCache.serverIP;
        setTimeout(() => {
            this.updateHistoryUrl();
            if (userCache.historySelectedUrl = "") {
                userCache.historySelectedUrl = userCache.historyIps[0];
            }

            let isFind = false;
            let options = this.$.historyServerIPSelect.$select.options;
            for (let i = 0; i < options.length; i++) {
                if (options.text == userCache.historySelectedUrl) {
                    this.$.historyServerIPSelect.$select.value = i;
                    isFind = true;
                    break;
                }
            }
            if (!isFind) {
                userCache.historySelectedUrl = userCache.historyIps[0];
                this.$.historyServerIPSelect.$select.value = 0;
            }
        }, 10);
        this.$.buildDir.value = userCache.buildDir;
        this.$.manifestDir.value = this.getManifestDir(userCache.buildDir);
        this.$.remoteDir.value = userCache.remoteDir

        //bundles 配置
        //`is${gameInfo.dir}includeApp`
        Object.keys(userCache.bundles).forEach((key) => {
            //是否在包内
            this.$[`is${key}includeApp`].value = userCache.bundles[key].includeApk;
            //版本号
            this.$[`${key}Version`].value = userCache.bundles[key].version;
        });

        //测试环境
        this.onRefreshMainVersion();
        Object.keys(userCache.bundles).forEach((key) => {
            this.onRefreshBundleLocalServerVersion(key);
        });
    },
    /**@description 返回远程版本号+md5 */
    getShowRemoteString(config) {
        return `[${config.version}] : ${config.md5}`;
    },
    /**@description 初始化数据 */
    initDatas() {
        this._isDoCreate = false;
        this.readCache();
        this.initUIDatas()
    },
    /**@description 绑定界面事件 */
    bindingEvents() {
        this.$.useLocalIP.addEventListener("confirm", this.onUseLocalIP.bind(this));
        this.$.serverIP.addEventListener("blur", this.onInputServerUrlOver.bind(this, this.$.serverIP));
        this.$.historyServerIPSelect.addEventListener("change", this.onHistoryServerIPChange.bind(this, this.$.historyServerIPSelect));
        this.$.version.addEventListener("blur", this.onVersionChange.bind(this, this.$.version));
        //bundles 版本设置
        let keys = Object.keys(userCache.bundles);
        keys.forEach((key) => {
            //是否在包内
            //this.$[`is${key}includeApp`].value = userCache.bundles[key].includeApk;
            //版本号
            this.$[`${key}Version`].addEventListener('blur', this.onBundleVersionChange.bind(this, this.$[`${key}Version`], key));
        });
        //选择构建目录
        this.$.buildDir.addEventListener("confirm", this.onBuildDirConfirm.bind(this, this.$.buildDir));
        //本地测试目录
        this.$.remoteDir.addEventListener("confirm", this.onRemoteDirConfirm.bind(this, this.$.remoteDir));
        //生成
        this.$.createManifest.addEventListener("confirm", this.onCreateManifest.bind(this, this.$.createManifest));
        //部署
        this.$.deployToRemote.addEventListener("confirm", this.onDeployToRemote.bind(this));
        //主包地址刷新 
        this.$.refreshMainVersion.addEventListener("confirm", this.onRefreshMainVersion.bind(this));
        //refresh${gameInfo.dir}Version 子包地址刷新
        keys.forEach((key) => {
            this.$[`is${key}includeApp`].addEventListener("confirm", this.onIncludeAppChange.bind(this, this.$[`is${key}includeApp`], key));
            this.$[`refresh${key}Version`].addEventListener("confirm", this.onRefreshBundleLocalServerVersion.bind(this, key))
        });
        //删除不包含在包内的bundles
        this.$.delBunles.addEventListener("confirm", this.onDelBundles.bind(this));
        //插入热更新代码
        this.$.insertHotupdate.addEventListener("confirm", this.onInsertHotupdate.bind(this));
    },
    //插入热更新代码
    onInsertHotupdate() {
        let codePath = path.join(__dirname, "../code/hotupdate.js");
        let code = fs.readFileSync(codePath, "utf8");
        // console.log(code);
        let sourcePath = userCache.buildDir + "/main.js";
        let sourceCode = fs.readFileSync(sourcePath,"utf8");
        let templateReplace = function templateReplace() {
            // console.log(arguments);
            return arguments[1] + code + arguments[3];
        }
        //添加子游戏测试环境版本号
        sourceCode = sourceCode.replace(/(\);)([\s\w\S]*)(const[ ]*importMapJson)/g,templateReplace);
        this.addLog(`向${sourcePath}中插入热更新代码`);
        fs.writeFileSync(sourcePath,sourceCode,{"encoding" : "utf8"});
    },
    //初始化
    init() {
        this.initDatas();
        this.bindingEvents();
    },
    onIncludeAppChange(element, key) {
        // console.log("element",element);
        // console.log("key",key);
        // console.log("value",element.value);
        userCache.bundles[key].includeApk = element.value;
        this.saveUserCache();
    },
    /**@description 删除不包含在包内的bundles */
    async onDelBundles() {
        if (this.isDoCreate()) return;
        const config = {
            title: '警告',
            detail: '',
            buttons: ['取消', '确定'],
        };
        const code = await Editor.Dialog.info('执行此操作将会删除不包含在包内的所有bundles,是否继续？', config);
        if (code.response == 1) {
            this.removeNotInApkBundle();
            this.remake()
        }
    },
    /**@description 删除不包含在包内的所有bundles */
    removeNotInApkBundle() {
        let keys = Object.keys(userCache.bundles);
        let removeBundles = [];
        keys.forEach((key) => {
            if (!userCache.bundles[key].includeApk) {
                removeBundles.push(key);
            }
        });
        let manifests = [];
        let removeDirs = [];
        for (let i = 0; i < removeBundles.length; i++) {
            let key = removeBundles[i];
            removeDirs.push(path.join(userCache.buildDir, `assets/${key}`));
            manifests.push(path.join(userCache.buildDir, `manifest/${key}_project.json`));
            manifests.push(path.join(userCache.buildDir, `manifest/${key}_version.json`));
        }

        for (let i = 0; i < removeDirs.length; i++) {
            this.addLog(`删除目录 : ${removeDirs[i]}`);
            this.delDir(removeDirs[i], true);
        }

        for (let i = 0; i < manifests.length; i++) {
            this.addLog(`删除版本文件 : ${manifests[i]}`);
            this.delFile(manifests[i]);
        }

    },
    /**
     * @description 刷新测试环境主包信息
     */
    onRefreshMainVersion() {
        if (this.isDoCreate()) return;
        if (userCache.remoteDir.length > 0) {
            let versionManifestPath = path.join(userCache.remoteDir, "manifest/main_version.json");
            fs.readFile(versionManifestPath, "utf-8", (err, data) => {
                if (err) {
                    this.addLog(`找不到 : ${versionManifestPath}`);
                } else {
                    let config = JSON.parse(data);
                    this.$.remoteUrl.value = this.getShowRemoteString(config);
                    this.saveUserCache();
                }
            });
        } else {
            this.addLog(`只能刷新部署在本地的版本`);
        }
    },
    /**
     * @description 刷新测试环境子包信息
     * @param {*} key 
     */
    onRefreshBundleLocalServerVersion(key) {
        if (this.isDoCreate()) return;
        if (userCache.remoteDir.length > 0) {
            let versionManifestPath = path.join(userCache.remoteDir, `manifest/${key}_version.json`);
            fs.readFile(versionManifestPath, "utf-8", (err, data) => {
                if (err) {
                    this.addLog(`找不到 : ${versionManifestPath}`);
                } else {
                    let config = JSON.parse(data);
                    this.$[`${key}remoteUrl`].value = this.getShowRemoteString(config);
                    this.saveUserCache();
                }
            });
        } else {
            this.addLog(`只能刷新部署在本地的版本`);
        }
    },
    /**
     * @description 部署
     */
    onDeployToRemote() {
        if (this.isDoCreate()) return;
        if (userCache.remoteDir.length <= 0) {
            this.addLog("[部署]请先选择本地服务器目录");
            return;
        }
        if (!fs.existsSync(userCache.remoteDir)) {
            this.addLog(`[部署]本地测试服务器目录不存在 : ${userCache.remoteDir}`);
            return;
        }
        if (!fs.existsSync(userCache.buildDir)) {
            this.addLog(`[部署]构建目录不存在 : ${userCache.buildDir} , 请先构建`);
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
            } else {
                dir = dir.substr(0, index);
                if (temps.indexOf(dir) == -1) {
                    temps.push(dir);
                }
            }
        }

        let copyDirs = ["manifest"].concat(temps);
        for (let i = 0; i < copyDirs.length; i++) {
            let dir = path.join(userCache.buildDir, copyDirs[i]);
            if (!fs.existsSync(dir)) {
                this.addLog(`${userCache.buildDir} [部署]不存在${copyDirs[i]}目录,无法拷贝文件`);
                return;
            }
        }

        this.addLog(`[部署]开始拷贝文件到 : ${userCache.remoteDir}`);
        this.$.deployProgress.value = 0;
        this.addLog(`[部署]删除旧目录 : ${userCache.remoteDir}`);
        let count = this.getFileCount(userCache.remoteDir);
        this.addLog(`[部署]删除文件个数:${count}`);
        this.delDir(userCache.remoteDir);

        count = 0;
        for (let i = 0; i < copyDirs.length; i++) {
            let dir = path.join(userCache.buildDir, copyDirs[i]);
            count += this.getFileCount(dir);
        }

        //压缩文件数量
        let zipPath = Editor.Project.path + "/PackageVersion";
        count += this.getFileCount(zipPath);

        this.addLog(`[部署]复制文件个数 : ${count}`);

        for (let i = 0; i < copyDirs.length; i++) {
            this.copySourceDirToDesDir(path.join(userCache.buildDir, copyDirs[i]), path.join(userCache.remoteDir, copyDirs[i]));
        }

        let remoteZipPath = path.join(userCache.remoteDir,"zips");
        this.delDir(remoteZipPath);

        //部署压缩文件
        this.copySourceDirToDesDir(zipPath,remoteZipPath);

    },
    addProgress() {
        let value = this.$.deployProgress.value;
        value = value + 1;
        if (value > 100) {
            value = 100;
        }
        this.$.deployProgress.value = value;
    },
    copySourceDirToDesDir(source, dest) {
        this.addLog(`[部署]复制${source} => ${dest}`);
        let self = this;
        let makeDir = function (_source, _dest, _copyFileCb) {
            fs.exists(_dest, function (isExist) {
                isExist ? _copyFileCb(_source, _dest) : fs.mkdir(_dest, function () {
                    self.addProgress(), _copyFileCb(_source, _dest)
                })
            })
        };
        let copyFile = function (_source, _dest) {
            fs.readdir(_source, function (err, files) {
                if (err) throw err;
                files.forEach(function (filename) {
                    let readStream;
                    let writeStram;
                    let sourcePath = _source + "/" + filename;
                    let destPath = _dest + "/" + filename;
                    fs.stat(sourcePath, function (err, stats) {
                        if (err) throw err;
                        if (stats.isFile()) {
                            readStream = fs.createReadStream(sourcePath);
                            writeStram = fs.createWriteStream(destPath);
                            readStream.pipe(writeStram);
                            self.addProgress();
                        } else {
                            stats.isDirectory() && makeDir(sourcePath, destPath, copyFile)
                        }
                    })
                })
            })
        };
        makeDir(source, dest, copyFile)
    },
    getFileCount(dir) {
        let count = 0;
        let counter = function (dir) {
            let readdir = fs.readdirSync(dir);
            for (let i in readdir) {
                count++;
                let fullPath = path.join(dir, readdir[i]);
                fs.statSync(fullPath).isDirectory() && counter(fullPath)
            }
        };
        return counter(dir), count
    },
    /**@description 返回需要添加到主包版本的文件目录 */
    getMainBundleIncludes() {
        return [
            // "src", //这个里面会包含工程的插件脚本，如该工程的protobuf.js CryptoJS.js,如果考虑后面会升级，加入到里面
            // "jsb-adapter", //这个东西一般不会变，不用加载到版本控制中
            "assets/main",
            "assets/resources",
        ];
    },
    /**@description 生成manifest版本文件 */
    onCreateManifest(element) {
        if (this.isDoCreate()) return;
        this._isDoCreate = true;
        this.saveUserCache();
        this.addLog(`当前用户配置为 : `, userCache);
        this.addLog("开始生成Manifest配置文件...");
        let version = userCache.version;
        this.addLog("主包版本号:", version);
        let buildDir = userCache.buildDir;
        buildDir = buildDir.replace(/\\/g, "/");
        this.addLog("构建目录:", buildDir);
        let manifestDir = this.getManifestDir(buildDir);
        manifestDir = manifestDir.replace(/\\/g, "/");
        this.addLog("构建目录下的Manifest目录:", manifestDir);
        let serverUrl = userCache.serverIP;
        this.addLog("热更新地址:", serverUrl);
        let subBundles = Object.keys(userCache.bundles);
        this.addLog("所有子包:", subBundles);
        let manifest = {
            assets: {},
            bundle : "main"
        };
        
        //删除旧的版本控件文件
        this.addLog("删除旧的Manifest目录", manifestDir);
        if (fs.existsSync(manifestDir)) {
            this.addLog("存在旧的，删除掉");
            this.delDir(manifestDir);
        }
        this.mkdirSync(manifestDir);

        //读出主包资源，生成主包版本
        let mainIncludes = this.getMainBundleIncludes();
        for (let i = 0; i < mainIncludes.length; i++) {
            this.readDir(path.join(buildDir, mainIncludes[i]), manifest.assets, buildDir);
        }

        //生成project.manifest
        let projectManifestPath = path.join(manifestDir, "main_project.json");
        let versionManifestPath = path.join(manifestDir, "main_version.json");
        let content = JSON.stringify(manifest);
        let md5 = require("crypto").createHash('md5').update(content).digest('hex');
        manifest.md5 = md5;
        manifest.version = version;
        fs.writeFileSync(projectManifestPath,JSON.stringify(manifest));
        this.addLog(`生成${projectManifestPath}成功`);

        delete manifest.assets;

        fs.writeFileSync(versionManifestPath, JSON.stringify(manifest));
        this.addLog(`生成${versionManifestPath}成功`);

        //生成所有版本控制文件，用来判断当玩家停止在版本1，此时发版本2时，不让进入游戏，返回到登录，重新走完整个更新流程
        let versions = {
            main : {md5: md5,version:version},
        }

        //生成各bundles版本文件
        for (let i = 0; i < subBundles.length; i++) {
            let key = subBundles[i];
            this.addLog(`正在生成:${key}`);
            let manifest = {
                assets: {},
                bundle:key
            };
            this.readDir(path.join(buildDir, `assets/${key}`), manifest.assets, buildDir);
            projectManifestPath = path.join(manifestDir, `${key}_project.json`);
            versionManifestPath = path.join(manifestDir, `${key}_version.json`);

            let content = JSON.stringify(manifest);
            let md5 = require("crypto").createHash('md5').update(content).digest('hex');
            manifest.md5 = md5;
            manifest.version = userCache.bundles[key].version
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
        let versionsPath = path.join(manifestDir,`versions.json`);
        fs.writeFileSync(versionsPath,JSON.stringify(versions));
        this.addLog(`生成versions.json成功`);
        this.packageZip(mainIncludes,versions);
        this.remake()
    },
    packageDir(dir, jszip) {
        if (!fs.existsSync(dir)) {
          return
        }
        let readDirs = fs.readdirSync(dir);
        for (let i = 0; i < readDirs.length; i++) {
          let file = readDirs[i];
          let fullPath = path.join(dir, file);
          let stat = fs.statSync(fullPath);
          if (stat.isFile()) {
            jszip.file(file, fs.readFileSync(fullPath))
          } else {
            stat.isDirectory() && this.packageDir(fullPath, jszip.folder(file))
          }
        }
      },
    packageZip(mainIncludes,versions) {
        this.addLog(`[打包] 开始打包版本...`);
        let jszip = new(require("../node_modules/jszip"));
        for (let index = 0; index < mainIncludes.length; index++) {
            const element = mainIncludes[index];
            let fullPath = path.join(userCache.buildDir, element);
            this.packageDir(fullPath, jszip.folder(element));

        }

        let packZipRootPath = Editor.Project.path + "/PackageVersion";
        this.delDir(packZipRootPath);
        this.mkdirSync(packZipRootPath);
        let packZipName = `main_${versions["main"].md5}.zip`;
        let packVersionZipPath = path.join(packZipRootPath, packZipName);
        jszip.generateNodeStream({
            type: "nodebuffer",
            streamFiles: !0
        }).pipe(fs.createWriteStream(packVersionZipPath)).on("finish", () => {
            this.addLog("[打包] 打包成功: " + packVersionZipPath)
        }).on("error", (e) => {
            this.addLog("[打包] 打包失败:" + e.message)
        })

        //打包子版本
        let bundles = Object.keys(userCache.bundles);
        for (let index = 0; index < bundles.length; index++) {
            const element = userCache.bundles[bundles[index]];
            let packZipName = `${element.dir}_${versions[element.dir].md5}.zip`;
            let packVersionZipPath = path.join(packZipRootPath, packZipName);
            let jszip = new(require("../node_modules/jszip"));
            let fullPath = path.join(userCache.buildDir, `assets/${element.dir}`);
            this.packageDir(fullPath, jszip.folder(`assets/${element.dir}`));
            this.addLog(`[打包] ${element.name} ${element.dir} ...`);
            jszip.generateNodeStream({
                type: "nodebuffer",
                streamFiles: !0
            }).pipe(fs.createWriteStream(packVersionZipPath)).on("finish", () => {
                this.addLog("[打包] 打包成功: " + packVersionZipPath)
            }).on("error", (e) => {
                this.addLog("[打包] 打包失败:" + e.message)
            })
        }

        this._isDoCreate = false;
    },
    delDir(sourceDir, isRemoveSourceDir = false) {
        let delFile = function (dir) {
            if (!fs.existsSync(dir)) return;
            let readDir = fs.readdirSync(dir);
            for (let i in readDir) {
                let fullPath = path.join(dir, readDir[i]);
                fs.statSync(fullPath).isDirectory() ? delFile(fullPath) : fs.unlinkSync(fullPath)
            }
        };
        let delDir = function (dir) {
            if (!fs.existsSync(dir)) return;
            let readDir = fs.readdirSync(dir);
            if (readDir.length > 0) {
                for (let i in readDir) {
                    let fullPath = path.join(dir, readDir[i]);
                    delDir(fullPath)
                }
                (dir !== sourceDir || isRemoveSourceDir) && fs.rmdirSync(dir)
            } else {
                (dir !== sourceDir || isRemoveSourceDir) && fs.rmdirSync(dir)
            }
        };
        delFile(sourceDir);
        delDir(sourceDir)
    },
    delFile(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    },
    mkdirSync(dir) {
        try {
            fs.mkdirSync(dir)
        } catch (e) {
            if ("EEXIST" !== e.code) throw e
        }
    },
    readDir(dir, obj, source) {
        var stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            return;
        }
        var subpaths = fs.readdirSync(dir),
            subpath, size, md5, compressed, relative;
        for (var i = 0; i < subpaths.length; ++i) {
            if (subpaths[i][0] === '.') {
                continue;
            }
            subpath = path.join(dir, subpaths[i]);
            stat = fs.statSync(subpath);
            if (stat.isDirectory()) {
                this.readDir(subpath, obj, source);
            } else if (stat.isFile()) {
                // Size in Bytes
                size = stat['size'];
                md5 = require("crypto").createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
                compressed = path.extname(subpath).toLowerCase() === '.zip';
                relative = path.relative(source, subpath);
                relative = relative.replace(/\\/g, '/');
                relative = encodeURI(relative);

                obj[relative] = {
                    'size': size,
                    'md5': md5
                };

                if (compressed) {
                    obj[relative].compressed = true;
                }
            }
        }
    },
    /**
     * @description 本地测试服务器选择确定
     * @param {*} element 
     */
    onRemoteDirConfirm(element) {
        if (this.isDoCreate()) return;
        userCache.remoteDir = element.value;
        this.saveUserCache();
    },
    /**
     * @description 构建目录选择
     * @param {*} element 
     */
    onBuildDirConfirm(element) {
        if (this.isDoCreate()) return;
        userCache.buildDir = element.value;
        this.$.manifestDir.value = this.getManifestDir(userCache.buildDir);
        this.saveUserCache();
    },
    /** @description 主版本号输入*/
    onVersionChange(element) {
        if (this.isDoCreate()) return;
        let version = element.value;
        //有效版本
        userCache.version = version;
        this.saveUserCache();
    },
    /**
     * @description bundle输入版本号变化
     * @param {*} element 
     * @param {*} key 
     * @returns 
     */
    onBundleVersionChange(element, key) {
        if (this.isDoCreate()) return;
        let version = element.value;
        userCache.bundles[key].version = version;
        this.saveUserCache();
    },
    /** 
     * @description 切换历史地址 
     * @param element 控件自身 
     */
    onHistoryServerIPChange(element) {
        if (this.isDoCreate()) return;
        //先拿到选中项
        let options = this.$.historyServerIPSelect.$select.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value == element.value) {
                userCache.serverIP = options[i].text;
                break;
            }
        }
        this.onInputServerUrlOver();
    },
    /** @description 点击了使用本机*/
    onUseLocalIP() {
        if (this.isDoCreate()) return;
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
            userCache.serverIP = "http://" + url;
        }
        this.onInputServerUrlOver();
    },
    /**
     * @description 输入服务器地址结束
     * @param {*} element 
     * @returns 
     */
    onInputServerUrlOver(element) {
        if (this.isDoCreate()) return;
        let url = userCache.serverIP;
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

        this.$.serverIP.value = url;
        userCache.serverIP = url;
        if (this.addHotAddress(url)) {
            this.updateHistoryUrl();
        }
        this.saveUserCache();
    },
    /**@description 更新历史地址 */
    updateHistoryUrl() {
        this.$.historyServerIPSelect.$select.options.length = 0;
        for (let i = 0; i < userCache.historyIps.length; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.text = userCache.historyIps[i];
            this.$.historyServerIPSelect.$select.options.add(option);
        }
    },
    /**
     * @description 添加历史地址 
     * @param url
     * */
    addHotAddress(url) {
        if (userCache.historyIps.indexOf(url) == -1) {
            userCache.historyIps.push(url);
            this.addLog(`添加历史记录 :${url} 成功`);
            return true;
        }
        return false;
    },
    /**
     * @description 是否正在创建
     * @returns 
     */
    isDoCreate() {
        if (this._isDoCreate) {
            this.addLog(`正在执行生成操作，请勿操作`);
        }
        return this._isDoCreate;
    },
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
        } else {
            console.log(message);
        }

        let text = "";
        if (obj == null) {
            text = message;
        } else if (typeof obj == "object") {
            text = message + JSON.stringify(obj);
        } else {
            text = message + obj.toString();
        }
        let temp = this.$.logView.value;
        if (temp.length > 0) {
            this.$.logView.value = temp + "\n" + text;
        } else {
            this.$.logView.value = text;
        }
        setTimeout(() => {
            this.$.logView.$textarea.scrollTop = this.$.logView.$textarea.scrollHeight;
        }, 10)
    },
    remake() {
        if (os.type() !== 'Darwin') {//判断mac os平台
            return
        }
        const projectPath = Editor.Project.path
        const nativeIosPath = projectPath + "/native/engine/ios"
        const iosProjPath = projectPath + "/build/ios/proj"
        const resPath = projectPath + "/build/ios"
        if (!fs.existsSync(resPath) || !fs.existsSync(nativeIosPath)) {
            return;
        }
        const prev = path.resolve(Editor.App.path, "..")
        const cmake = prev + "/tools/cmake/bin/cmake"//cocos目录下的cmake执行程序
        console.log(cmake)
        const cmd = cmake + " with -S " + nativeIosPath + " -GXcode -B" + iosProjPath +
            " -DCMAKE_SYSTEM_NAME=iOS -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_C_COMPILER=clang -DRES_DIR=" + resPath
        exec(cmd, {encoding: 'utf8'}, function (err, stdout, stderr) {//重新执行一下cmake
            if (err) {
                console.log(err);
            }
            if (stderr) {
                console.log(stderr);
            }
            console.log(stdout);
        });
    }
}
//面板上的解发事件
exports.listeners = {

};

// 当面板渲染成功后触发
exports.ready = async function () {
    this.init();
};
// 尝试关闭面板的时候触发
exports.beforeClose = async function () {

};
// 当面板实际关闭后触发
exports.close = async function () {

};