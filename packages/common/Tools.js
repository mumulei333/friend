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
exports.Tools = void 0;
/**
 * @description 公共工具类
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class _Tools {
    /**@description 获取目录下文件个数 */
    getDirFileCount(dir) {
        let count = 0;
        let counter = (dir) => {
            let readdir = fs.readdirSync(dir);
            for (let i in readdir) {
                count++;
                let fullPath = path.join(dir, readdir[i]);
                fs.statSync(fullPath).isDirectory() && counter(fullPath);
            }
        };
        counter(dir);
        return count;
    }
    /**@description 压缩文件到zip */
    zipDir(dir, jszip) {
        if (!fs.existsSync(dir) || !jszip) {
            return;
        }
        let readDirs = fs.readdirSync(dir);
        for (let i = 0; i < readDirs.length; i++) {
            let file = readDirs[i];
            let fullPath = path.join(dir, file);
            let stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                jszip.file(file, fs.readFileSync(fullPath));
            }
            else {
                stat.isDirectory() && this.zipDir(fullPath, jszip.folder(file));
            }
        }
    }
    /**
     * @description 打包版本文件
     */
    zipVersions(config) {
        let JSZIP = require("jszip");
        let jszip = new JSZIP();
        for (let index = 0; index < config.mainIncludes.length; index++) {
            const element = config.mainIncludes[index];
            let fullPath = path.join(config.buildDir, element);
            this.zipDir(fullPath, jszip.folder(element));
        }
        let packZipName = `main_${config.versions["main"].md5}.zip`;
        let packZipRootPath = Editor.Project.path + "/PackageVersion";
        let packVersionZipPath = path.join(packZipRootPath, packZipName);
        this.delDir(packZipRootPath);
        this.mkdirSync(packZipRootPath);
        config.log(`打包路径: ${packZipRootPath}`);
        jszip.generateNodeStream({
            type: "nodebuffer",
            streamFiles: !0
        }).pipe(fs.createWriteStream(packVersionZipPath)).on("finish", () => {
            config.log("[打包] 打包成功: " + packZipName);
        }).on("error", (e) => {
            config.log("[打包] 打包失败:" + e.message);
        });
        //打包子版本
        let bundles = config.bundles;
        for (let index = 0; index < bundles.length; index++) {
            const element = bundles[index];
            let packZipName = `${element.dir}_${config.versions[element.dir].md5}.zip`;
            let packVersionZipPath = path.join(packZipRootPath, packZipName);
            let jszip = new JSZIP();
            let fullPath = path.join(config.buildDir, `assets/${element.dir}`);
            this.zipDir(fullPath, jszip.folder(`assets/${element.dir}`));
            config.log(`[打包] ${element.name} ${element.dir} ...`);
            jszip.generateNodeStream({
                type: "nodebuffer",
                streamFiles: !0
            }).pipe(fs.createWriteStream(packVersionZipPath)).on("finish", () => {
                config.log("[打包] 打包成功: " + packZipName);
            }).on("error", (e) => {
                config.log("[打包] 打包失败:" + e.message);
            });
        }
    }
    /**@description 创建目录 */
    mkdirSync(dir) {
        try {
            fs.mkdirSync(dir);
        }
        catch (e) {
            if ("EEXIST" !== e.code)
                throw e;
        }
    }
    /**
     * @description 删除目录
     * @param sourceDir 源目录
     * @param isRemoveSourceDir 是否删除源目录本身，默认不删除
     */
    delDir(sourceDir, isRemoveSourceDir = false) {
        let delFile = (dir) => {
            if (!fs.existsSync(dir))
                return;
            let readDir = fs.readdirSync(dir);
            for (let i in readDir) {
                let fullPath = path.join(dir, readDir[i]);
                fs.statSync(fullPath).isDirectory() ? delFile(fullPath) : fs.unlinkSync(fullPath);
            }
        };
        let delDir = (dir) => {
            if (!fs.existsSync(dir))
                return;
            let readDir = fs.readdirSync(dir);
            if (readDir.length > 0) {
                for (let i in readDir) {
                    let fullPath = path.join(dir, readDir[i]);
                    delDir(fullPath);
                }
                (dir !== sourceDir || isRemoveSourceDir) && fs.rmdirSync(dir);
            }
            else {
                (dir !== sourceDir || isRemoveSourceDir) && fs.rmdirSync(dir);
            }
        };
        delFile(sourceDir);
        delDir(sourceDir);
    }
    /**
     * @description 删除文件
     * @param filePath
     * @returns
     */
    delFile(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    /**
     * @description 复制整个目录
     * @param source 源
     * @param dest 目标
     * @param copyFileCb 复制文件完成回调
     */
    copySourceDirToDesDir(source, dest, copyFileCb) {
        let self = this;
        let makeDir = (_source, _dest, _copyFileCb) => {
            fs.exists(_dest, function (isExist) {
                isExist ? _copyFileCb(_source, _dest) : fs.mkdir(_dest, function () {
                    if (copyFileCb)
                        copyFileCb(), _copyFileCb(_source, _dest);
                });
            });
        };
        let copyFile = (_source, _dest) => {
            fs.readdir(_source, function (err, files) {
                if (err)
                    throw err;
                files.forEach(function (filename) {
                    let readStream;
                    let writeStram;
                    let sourcePath = _source + "/" + filename;
                    let destPath = _dest + "/" + filename;
                    fs.stat(sourcePath, function (err, stats) {
                        if (err)
                            throw err;
                        if (stats.isFile()) {
                            readStream = fs.createReadStream(sourcePath);
                            writeStram = fs.createWriteStream(destPath);
                            readStream.pipe(writeStram);
                            if (copyFileCb)
                                copyFileCb();
                        }
                        else {
                            stats.isDirectory() && makeDir(sourcePath, destPath, copyFile);
                        }
                    });
                });
            });
        };
        makeDir(source, dest, copyFile);
    }
    /**
     * @description 读取目录下的所有文件的md5及大小信息到obj
     * @param dir 读取目录
     * @param obj 输出对象
     * @param source
     * @returns
     */
    readDir(dir, obj, source) {
        var stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            return;
        }
        var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
        for (var i = 0; i < subpaths.length; ++i) {
            if (subpaths[i][0] === '.') {
                continue;
            }
            subpath = path.join(dir, subpaths[i]);
            stat = fs.statSync(subpath);
            if (stat.isDirectory()) {
                this.readDir(subpath, obj, source);
            }
            else if (stat.isFile()) {
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
    }
}
exports.Tools = new _Tools();