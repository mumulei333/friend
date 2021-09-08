
export class EventOption {
    private _data: any = null
    private _type: string = null
    public constructor(type: string, data?: any) {
        this._data = data
        this._type = type
    }
    public get data(): any { return this._data }
    public get type(): string { return this._type }
}
