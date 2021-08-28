import { InjectObjectUtility } from "./InjectObjectUtility"

export class InjectData {
    public update(data: object): void { this.analysis(data) }

    protected analysis(data: object, ...cystomPropertys: any[]): void {
        InjectObjectUtility.Analysis(this, this, data, this.customSetProperty, this.unOwnSetProperty, cystomPropertys)
    }

    /**
       * 当前对象不存在正在解析的属性值
       */
    protected unOwnSetProperty(thisObj: object, data: object, property: string): void { }

    /**
    * 设置自定义的属性
    */
    protected customSetProperty(thisObj: object, data: any, property: string): void {
        if (Reflect.has(this, property)) {
            let inject = Reflect.get(this, property)
            if (inject instanceof InjectData) { inject.update(data[property]) }
        }
        else { this.unOwnSetProperty(thisObj, data, property) }
    }

}