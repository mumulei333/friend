"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = __importDefault(require("vue/dist/vue"));
module.exports = Editor.Panel.extend({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        text: '#text',
    },
    methods: {
        hello() {
            // if (this.$.text) {
            //     this.$.text.innerHTML = 'hello';
            //     console.log('[cocos-panel-html.default]: hello');
            // }
        },
    },
    ready() {
        let vv = this;
        Editor.log(vv.$app);
        if (vv.$text) {
            vv.$text.innerHTML = 'Hello Cocos.';
        }
        if (vv.$app) {
            const vm = new vue_1.default({
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../../static/template/vue/app.html'), 'utf-8'),
                data() {
                    return {
                        counter: 0,
                    };
                },
                methods: {
                    addition() {
                        this.counter += 1;
                    },
                    subtraction() {
                        this.counter -= 1;
                    },
                },
                el: vv.$app,
            });
        }
    },
    beforeClose() { },
    close() { },
});
